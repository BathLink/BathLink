import json
import boto3
import hashlib

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")
meetups_table = dynamodb.Table("meetups-table")
activities_table = dynamodb.Table("activities-table")

def get_activity_ids(users):
    activity_ids = set()
    for user in users:
        for act_id in user["matchPreferences"]["activities"]:
            activity_ids.add(act_id)
    return list(activity_ids)
    
def get_activities(activity_ids):
    if not activity_ids:
        return {}

    activities = {}
    for activity_id in activity_ids:
        response = activities_table.get_item(Key={"activity-id": activity_id})
        item = response.get("Item")
        if item:
            activities[activity_id] = item

    return activities
    
def group_users_by_time_slot(users, activities):
    try:
        matches = {}
        for user in users:
            user_id = user["student-id"]
            free_times = user["calendar"]["available"]
            preferred_activities = user["matchPreferences"]["activities"]
            for time_slot in free_times:
                for activity_id in preferred_activities:
                    if activity_id in activities:
                        if time_slot not in matches:
                            matches[time_slot] = {}
                        if activity_id not in matches[time_slot]:
                            matches[time_slot][activity_id] = []
                        matches[time_slot][activity_id].append(user_id)
        return matches
    except Exception as e:
        print(e)
        raise Exception(f"Error grouping users by time slot: {e}")
    

def generate_meetup_id(activity_id, participants, time_slot):
    # Ensure deterministic ordering
    key_data = {
        "activity_id": activity_id.strip(),
        "participants": sorted(participants),
        "time_slot": time_slot.strip()
    }
    # Create a string representation, then hash it
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.sha256(key_string.encode("utf-8")).hexdigest()

def create_meetups_from_groups(matches, activities):
    created_meetups = []
    for time_slot, activity_groups in matches.items():
        # Ensure a user is matched only once per time slot.
        matched_users_in_slot = set()
        for activity_id in sorted(activity_groups.keys()):
            available_users = [uid for uid in activity_groups[activity_id] if uid not in matched_users_in_slot]
            # Get the required group size from the activity record.
            required_num = int(activities[activity_id]["number_of_people"])
            # Only create a meetup if enough users are available for a complete group.
            while len(available_users) >= required_num:
                group = available_users[:required_num]
                matched_users_in_slot.update(group)
                meetup_id = generate_meetup_id(activity_id, group, time_slot)
                existing = meetups_table.get_item(Key={"meetup-id": meetup_id})
                if "Item" in existing:
                    available_users = available_users[required_num:]
                    continue
                meetup_item = {
                    "meetup-id": meetup_id,
                    "activity": activity_id,
                    "participants": group,
                    "time_slot": time_slot,
                    "confirmed": False,
                    "done": False,
                    "confirmed_users": []
                }
                created_meetups.append(meetup_item)
                available_users = available_users[required_num:]
        return created_meetups


def store_meetups(meetups):
    for meetup in meetups:
        meetups_table.put_item(Item=meetup)


def get_users_needing_match():

    response = users_table.scan()
    users = response["Items"]

    return [user for user in users if user["matchPreferences"]["enabled"] == True ]


def handle_post_request():

    users = get_users_needing_match()
    activity_ids = get_activity_ids(users)
    activities = get_activities(activity_ids)
    matches = group_users_by_time_slot(users, activities)
    created_meetups = create_meetups_from_groups(matches, activities)
    store_meetups(created_meetups)
    return {
        "statusCode": 200,
        "body": json.dumps(f"Created {len(created_meetups)} complete meetups.")
    }





def lambda_handler(event, context):
    try:
        http_method = event["httpMethod"]
        if http_method == "POST":
            return handle_post_request()

        else:
            return {"statusCode": 400, "body": f"{http_method} doesn't exist for meetups"}
    except Exception as e:
        print(e)
        return {
            "statusCode": 400,
            "body": json.dumps(f"Error: {e}")
        }
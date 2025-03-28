import json
import boto3
import uuid

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")
meetups_table = dynamodb.Table("meetups-table")
activities_table = dynamodb.Table("activities-table")

def get_activity_ids(users):
   
    try:
        activity_ids = set()
        for user in users:
            for act_id in user["matchPreferences"]["activity-id"]:
                activity_ids.add(act_id)
        return list(activity_ids)
    except Exception as e:
        print(e)
        raise Exception(f"Error extracting activity IDs: {e}")
    
def get_activities(activity_ids):
    try:
        if not activity_ids:
            return {}
        
        activities = {}
        for activity_id in activity_ids:
            response = activities_table.get_item(Key={"activity-id": activity_id})
            item = response.get("Item")
            if item:
                activities[activity_id] = item
        
        return activities
    except Exception as e:
        raise Exception(f"Error fetching activities: {e}")
    
def group_users_by_time_slot(users, activities):
    try:
        # Create a dictionary: { time_slot: { activity_id: [user_id, ...] } }
        matches = {}
        for user in users:
            user_id = user["student-id"]
            free_times = user["calendar"]
            preferred_activities = user["matchPreferences"]["activity-id"]
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

def create_meetups_from_groups(matches, activities):
    try:
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
                    meetup_item = {
                        "meetup-id": str(uuid.uuid4()),
                        "activity-id": activity_id,
                        "participants": group,
                        "time_slot": time_slot,
                        "confirmed": False,
                        "done": False,
                        "confirmed_users": []
                    }
                    created_meetups.append(meetup_item)
                    available_users = available_users[required_num:]
        return created_meetups
    except Exception as e:
        print(e)
        raise Exception(f"Error creating meetups from groups: {e}")

def store_meetups(meetups):
    try:
        for meetup in meetups:
            meetups_table.put_item(Item=meetup)
    except Exception as e:
        print(e)
        raise Exception(f"Error storing meetups: {e}")

def get_users_needing_match():
    try:
        response = users_table.scan()
        users = response["Items"]
        return [user for user in users if user["Enabled"] == True ]
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": f" get_users_needing_match error: {e}"}

def handle_post_request():
    try:
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
    except Exception as e:
        print(e)
        return {
            "statusCode": 400,
            "body": json.dumps(f"Error: {e}")
        }




def lambda_handler(event, context):
    http_method = event["httpMethod"]
    if http_method == "POST":
        return handle_post_request()

    else:
        return {"statusCode": 400, "body": f"{http_method} doesn't exist for meetups"}

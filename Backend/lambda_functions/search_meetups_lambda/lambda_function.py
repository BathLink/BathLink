import json
import boto3
import networkx as nx
import itertools
Max_number_of_meetups = 5
dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")
meetups_table = dynamodb.Table("meetups-table")
hobbies_table = dynamodb.Table("hobbies-table")



def build_matching_graph(users,meetup_id):
    try:
        G = nx.Graph()
        
        # Add users as nodes
        for user in users:
            G.add_node(user["user_id"], type="user", **user)

        # Create potential groups based on shared availability
        group_counter = 0
        potential_groups = []
        
        for time_slot in set(itertools.chain.from_iterable([u["availabilty"] for u in users])):
            for activity in set(itertools.chain.from_iterable([u["activities"] for u in users])):
                potential_groups[meetup_id] = {"activity": activity, "time_slot": time_slot, "users": []}
                G.add_node(meetup_id, type="meetup", activity=activity, time_slot=time_slot)

                # Add edges from users to meetups with a weight
                for user in users:
                    if time_slot in user["calendar"] and activity in user["activities"]:
                        weight = calculate_match_score(user, activity)
                        G.add_edge(user["user_id"], meetup_id, weight=weight)

        return G, potential_groups
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": f" build_graph error: {e}"}

def calculate_match_score(user, activity):
    score = 0 
    
    # Prioritise users with fewer preferred activities
    score += (5 - len(user["activities"])) * 5  

    # Prioritise users with limited availability
    score += (7 - len(user["availability"])) * 8  

    # Weight activity preference (higher-ranked activities get higher score)
    activity_rank = user["activity_rankings"].get(activity, 5)  # Default to mid-value if not ranked
    score += (activity_rank) * 5  

    #skill level matching
    skill_level = user["activity_skills"].get(activity, 2)
    if skill_level == activity["ability"]:
        score += 30
    

    return score

def match_users_to_groups(G):
    matches = nx.max_weight_matching(G, maxcardinality=True)
    return matches



def save_suggested_meetups(matches, potential_groups,G):
    try:
        for user, group in matches:
            if "user" in G.nodes[user]["type"]:
                group_details = next(g for g in potential_groups if g["group_id"] == group)
                meetup_id = f"{group_details['activity']}_{group_details['time_slot']}"

                meetups_table.put_item(
                    Item={
                        "meetup_id": meetup_id,
                        "activity": group_details["activity"],
                        "participants": group_details["users"],
                        "time_slot": group_details["time_slot"],
                        "confirmed": False,
                        "done": False
                    }
                )
    except Exception as e:
        print(e)
        return {"statusCode": 400, " body": f" save_suggested_meetups error: {e}"}

def get_users_needing_match():
    try:
        response = users_table.scan()
        users = response["Items"]
        return [user for user in users if (user["ongoing_meetups"] < Max_number_of_meetups)]
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": f" get_users_needing_match error: {e}"}

def handle_post_request(meetup_id):
    users = get_users_needing_match()
    g = build_matching_graph(users,meetup_id)
    matches = match_users_to_groups(g[0])
    save_suggested_meetups(matches, g[1],g[0] )
    return {
                "statusCode": 200,
                "body": json.dumps(
                    {"message": f"Meetups added to database"}
                ),
                "headers": {"Content-Type": "application/json"},
            }



def lambda_handler(event, context):
    http_method = event["httpMethod"]
    path_parameters = event.get("pathParameters", {})
    meetup_id = path_parameters.get("meetupId")
    if not meetup_id:
        return {
            "statusCode": 400,
            "body": "Missing meetupId in path parameters",
            "headers": {"Content-Type": "application/json"},
        }
    if http_method == "POST":
        return handle_post_request(meetup_id)

    else:
        return {"statusCode": 400, "body": f"{http_method} doesn't exist for meetups"}

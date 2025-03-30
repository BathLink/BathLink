import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")

def GET(event, _):
    user_id = event["pathParameters"]["userId"]

    response = users_table.get_item(Key={"student-id": user_id})
    if "Item" not in response:
        return 404, {"error": f"Cannot find user {user_id}"}
    return 200, response["Item"]["matchPreferences"]


def PUT(event, _):
    user_id = event["pathParameters"]["userId"]
    updated_preferences = event["body"]
    if type(updated_preferences) is str:
        updated_preferences = json.loads(updated_preferences)

    response = users_table.get_item(Key={"student-id": user_id})
    current_activities = response.get("Item", {}).get("matchPreferences", {}).get("activities", [])

    # Convert to a set for efficient operations
    activity_set = set(current_activities)

    # Process the updates
    for activity_id, enabled in updated_preferences.items():
        if enabled:
            activity_set.add(activity_id)  # Add if enabled
        else:
            activity_set.discard(activity_id)  # Remove if disabled

    # Update the item in DynamoDB
    response = users_table.update_item(
        Key={"student-id": user_id},
        UpdateExpression="SET matchPreferences.activities = :new_activities",
        ExpressionAttributeValues={":new_activities": list(activity_set)},
        ReturnValues="UPDATED_NEW"
    )


    return 200, {"message": "Preferences updated with new data"}





methods = [GET, PUT]


def lambda_handler(event, context):
    method = event["httpMethod"]
    for method_func in methods:
        if method_func.__name__ == method:
            status_code, body = method_func(event, context)
            return {
                "statusCode": status_code,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(body)
            }
    return {
        "statusCode": 501,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"error": "Http method not supported"})
    }

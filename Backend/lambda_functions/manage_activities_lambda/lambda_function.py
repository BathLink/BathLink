import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
activities_table = dynamodb.Table("activities-table")

def handle_get_request(activityId):

    rsp = activities_table.get_item(
        Key={"student-id": activityId}  # The partition key used in the DynamoDB table
    )

    if "Item" in rsp:
        activity_data = rsp["Item"]
        return {
            "statusCode": 200,
            "body": json.dumps(
                activity_data
            ),  # Return the activity data in the response
        }
    else:
        return {"statusCode": 404, "body": json.dumps(f"userId:{activityId} not found!")}

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    path_parameters = event.get("pathParameters", {})
    activityId = path_parameters.get("activityId")
    if not activityId:
        return {
            "statusCode": 400,
            "body": "Missing meetupId in path parameters",
            "headers": {"Content-Type": "application/json"},
        }

    if http_method == "GET":
        return handle_get_request(activityId)
    else:
        return {"statusCode": 400, "body": f"{http_method} doesn't exist for meetups"}

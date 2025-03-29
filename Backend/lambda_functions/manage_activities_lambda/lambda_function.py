import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
activities_table = dynamodb.Table("activities-table")

def handle_get_request(activity_id):

    if not activity_id:
        #Get all activities
        rsp = activities_table.scan()
        return {
            "statusCode": 200,
            "body": json.dumps(rsp.get("Items", [])),
        }

    rsp = activities_table.get_item(
        Key={"activity-id": activity_id}
    )

    if "Item" in rsp:
        activity_data = rsp["Item"]
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(
                activity_data
            ),
        }
    else:
        return {"statusCode": 404, "body": json.dumps(f"activityId:{activity_id} not found!")}

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    path_parameters = event.get("pathParameters", {})
    activity_id = None
    if path_parameters:
        activity_id = path_parameters.get("activityId")
        
    if http_method == "GET":
        return handle_get_request(activity_id)

    return {"statusCode": 400, "body": json.dumps("Unsupported method")}
   
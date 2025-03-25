import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
meetups_table = dynamodb.Table("meetups-table")


def handle_get_request(meetupId):
    try:
        rsp = meetups_table.get_item(Key={"meetup-id": meetupId})

        if "Item" in rsp:
            meetup_data = rsp["Item"]
            return {"statusCode": 200, "body": json.dumps(meetup_data)}
        else:
            return {"statusCode": 404, "body": f"meetupId:{meetupId} not found!"}
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": f"error: {e}"}


def handle_delete_request(meetupId):
    try:
        rsp = meetups_table.get_item(Key={"meetup-id": meetupId})

        if "Item" in rsp:
            try:
                del_rsp = meetups_table.delete_item(Key={"meetup-id": meetupId})

                return {
                    "statusCode": 200,
                    "body": f"Successfully deleted meetup-id {meetupId}",
                }

            except Exception as e:
                return {"statusCode": 400, "body": f"error: {e}"}

        else:
            return {"statusCode": 404, "body": f"meetupId:{meetupId} not found!"}
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": f"error: {e}"}


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

    if http_method == "GET":
        return handle_get_request(meetup_id)

    elif http_method == "DELETE":
        return handle_delete_request(meetup_id)

    else:
        return {"statusCode": 400, "body": f"{http_method} doesn't exist for meetups"}

import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
meetups_table = dynamodb.Table("meetups-table")


def handle_get_request(meetupId):

    rsp = meetups_table.get_item(Key={"meetup-id": meetupId})

    if "Item" in rsp:
        meetup_data = rsp["Item"]
        return {"statusCode": 200, "body": json.dumps(meetup_data)}
    else:
        return {
            "statusCode": 404,
            "body": json.dumps(f"meetupId:{meetupId} not found!"),
        }



def handle_put_request(event):

    path_parameters = event.get("pathParameters", {})
    meetup_id = path_parameters.get("meetupId")
    if not meetup_id:
        return {
            "statusCode": 400,
            "body": json.dumps("Missing meetup_id in path parameters"),
        }

    if type(event.get("body")) is str:
        body = json.loads(event.get("body", {}))
    else:
        body = event.get("body", {})

    print("checkpoint 1")
    print(body)
    print(type(body))

    user_id = body.get("userId")
    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps("Missing user_id in request body"),
        }

    print("checkpoint 2")

    # Get current meetup
    response = meetups_table.get_item(Key={"meetup-id": meetup_id})
    item = response.get("Item")

    if not item:
        return {"statusCode": 404, "body": json.dumps("Meetup not found")}

    confirmed_users = item.get("confirmed_users", [])
    participants = item.get("participants", [])

    if user_id not in confirmed_users:
        confirmed_users.append(user_id)

    # Check if all participants have confirmed
    all_confirmed = len(confirmed_users) == len(participants)

    # Update the meetup item in DynamoDB
    meetups_table.update_item(
        Key={"meetup-id": meetup_id},
        UpdateExpression="SET confirmed_users = :cu, confirmed = :c",
        ExpressionAttributeValues={":cu": confirmed_users, ":c": all_confirmed},
    )

    message = f"User {user_id} confirmed for meetup {meetup_id}."
    if all_confirmed:
        message += " Meetup is now confirmed."

    return {"statusCode": 200, "body": json.dumps(message)}




def handle_delete_request(meetupId):

    rsp = meetups_table.get_item(Key={"meetup-id": meetupId})

    if "Item" in rsp:

        del_rsp = meetups_table.delete_item(Key={"meetup-id": meetupId})

        return {
            "statusCode": 200,
            "body": json.dumps(f"Successfully deleted meetup-id {meetupId}"),
        }


    else:
        return {
            "statusCode": 404,
            "body": json.dumps(f"meetupId:{meetupId} not found!"),
        }



def lambda_handler(event, context):
    try:
        http_method = event["httpMethod"]
        path_parameters = event.get("pathParameters", {})
        meetup_id = path_parameters.get("meetupId")
        user_id = event.get("pathParameters", {}).get("user_id")

        if not meetup_id:
            # print(path_parameters)
            return {
                "statusCode": 400,
                "body": json.dumps("Missing meetupId in path parameters"),
                "headers": {"Content-Type": "application/json"},
            }

        if http_method == "GET":
            return handle_get_request(meetup_id)

        elif http_method == "DELETE":
            return handle_delete_request(meetup_id)
        elif http_method == "PUT":
            return handle_put_request(event)
        else:
            return {
                "statusCode": 400,
                "body": json.dumps(f"{http_method} doesn't exist for meetups"),
            }
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": json.dumps(f"error: {e}")}
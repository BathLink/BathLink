import json
import uuid

import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")
meetups_table = dynamodb.Table("meetups-table")

endpoint = "/users/userId"


def PostConfirmation(event, context):
    user_attributes = event["request"]["userAttributes"]

    users_table.put_item(
        Item={
            "student-id": user_attributes.get("sub"),
            "email": user_attributes.get("email"),
            "phone": user_attributes.get("phone_number"),
            "name": user_attributes.get("given_name")
            + " "
            + user_attributes.get("family_name"),
            "calendar": {"available": []},
            "dob": user_attributes.get("birthdate"),
            "profile": {},
            "matchPreferences": {"enabled": False, "activities": []},
        }
    )

    # Finn, Harry, Martin
    others = ['06621284-d031-70f3-f8e2-a21e5965e598','463252b4-c071-7011-ad55-29a0128416ba','26225284-d0a1-7004-1e01-973773a6990f']

    meetup_item = {
        "meetup-id": str(uuid.uuid4()),
        "activity": 'Tennis',
        "participants": others+[user_attributes.get("sub")],
        "time_slot": '2025-05-06 20:00:00',
        "confirmed": False,
        "done": False,
        "confirmed_users": others
    }

    meetups_table.put_item(
        Item=meetup_item
    )



    return event


def get_user_meetups(userId):

    response = meetups_table.scan(
        FilterExpression=f"contains(participants, :val)",
        ExpressionAttributeValues={":val": str(userId)},
    )

    return response.get("Items", [])


def handle_get_request(userId):

    rsp = users_table.get_item(
        Key={"student-id": userId}  # The partition key used in the DynamoDB table
    )

    if "Item" in rsp:
        user_data = rsp["Item"]
        return {
            "statusCode": 200,
            "body": json.dumps(user_data),  # Return the user data in the response
        }
    else:
        return {"statusCode": 404, "body": json.dumps(f"userId:{userId} not found!")}


def handle_put_request(userId, body):
    if type(body) == str:
        body = json.loads(body)

    if len(body) > 1:
        return {
            "statusCode": 400,
            "body": json.dumps("Send only ONE value to update, not multiple"),
        }
    try:
        rsp = users_table.get_item(Key={"student-id": userId})

        if "Item" in rsp:
            attributeToChange = list(body.keys())[0]
            newValue = body[attributeToChange]

            item = rsp["Item"]
            item[attributeToChange] = newValue

            users_table.put_item(Item=item)

            return {
                "statusCode": 200,
                "body": json.dumps(
                    f"Success! Updated the record for user-id {userId}, {attributeToChange}={newValue}"
                ),
            }

        else:
            return {
                "statusCode": 404,
                "body": json.dumps(f"userId:{userId} not found!"),
            }
    except Exception as e:
        print("Put handler error", e)
        return {"statusCode": 404, "body": json.dumps(f"Error: {e}")}


def lambda_handler(event, context):
    if (
        "triggerSource" in event
        and event["triggerSource"] == "PostConfirmation_ConfirmSignUp"
    ):
        return PostConfirmation(event, context)

    try:
        http_method = event.get("httpMethod")
        path = event.get("pathParameters")
        userId = path.get("userId")

        if "/meetups" in event.get("path") and http_method == "GET":
            return {
                "statusCode": 200,
                "body": json.dumps({"meetups": get_user_meetups(userId)}),
                "headers": {"Content-Type": "application/json"},
            }

        if http_method == "GET":
            return handle_get_request(userId)

        elif http_method == "PUT":
            body = event.get("body")
            print("Body is:", body)
            print(type(body))

            if not body:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Content of body is empty"),
                }
            else:
                return handle_put_request(userId, body)

        else:
            return {
                "statusCode": 500,
                "body": f"{http_method} does not exist for users",
            }

    except Exception as e:
        print("Lambda handler error", e)

        return {
            "statusCode": 500,
            "body": json.dumps(f"The server screwed up, error: {str(e)}"),
        }

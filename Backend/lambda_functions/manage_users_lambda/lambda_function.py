import json
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
        print(e)
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
        print(e)

        return {
            "statusCode": 500,
            "body": json.dumps(f"The server screwed up, error: {str(e)}"),
        }

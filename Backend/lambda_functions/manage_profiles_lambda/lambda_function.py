import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")


def handle_get_request(userId):

    rsp = users_table.get_item(
        Key={"student-id": userId}  # The partition key used in the DynamoDB table
    )

    if "Item" in rsp:
        user_data = rsp["Item"]
        return {
            "statusCode": 200,
            "body": json.dumps(
                user_data["profile"]
            ),  # Return the user data in the response
        }
    else:
        return {"statusCode": 404, "body": json.dumps(f"userId:{userId} not found!")}


def handle_post_request(userId, body):
    try:
        if type(body) == str:
            body = json.loads(body)
        social = body["social"]
        description = body["description"]
        pronouns = body["pronouns"]

        rsp = users_table.get_item(
            Key={"student-id": userId}  # The partition key used in the DynamoDB table
        )

        if "Item" not in rsp:
            return {
                "statusCode": 404,
                "body": json.dumps(
                    f"student-id {userId} doesnt exist and so this POST has been cancelled"
                ),
            }
        else:
            item = rsp["Item"]
            item["profile"]["social"] = social
            item["profile"]["description"] = description
            item["profile"]["pronouns"] = pronouns

            users_table.put_item(Item=item)

            return {
                "statusCode": 200,
                "body": json.dumps(f"Success! Updated {userId}'s profile"),
            }

    except Exception as e:
        print(e)
        return {
            "statusCode": 404,
            "body": json.dumps(f"The server crashed out cos {e}"),
        }


def handle_put_request(userId, body):
    try:
        if type(body) == str:
            body = json.loads(body)
        if len(body) > 1:
            return {
                "statusCode": 404,
                "body": json.dumps("Send only ONE value to update, not multiple"),
            }
        attributeToChange = list(body.keys())[0]
        newValue = body[attributeToChange]

        rsp = users_table.get_item(
            Key={"student-id": userId}  # The partition key used in the DynamoDB table
        )

        if "Item" not in rsp:
            return {
                "statusCode": 404,
                "body": json.dumps(
                    f"student-id {userId} doesnt exist and so this PUT has been cancelled"
                ),
            }
        else:
            item = rsp["Item"]
            item["profile"][attributeToChange] = newValue

            users_table.put_item(Item=item)

            return {
                "statusCode": 200,
                "body": json.dumps(
                    f"Success! Updated {userId}'s profile's attribute {attributeToChange} to {newValue}"
                ),
            }

    except Exception as e:
        print(e)
        return {
            "statusCode": 404,
            "body": json.dumps(f"The server crashed out cos {e}"),
        }


def lambda_handler(event, context):
    http_method = event["httpMethod"]
    user_id = event["pathParameters"]["userId"]

    if http_method == "GET":
        return handle_get_request(user_id)

    elif http_method == "POST":
        body = event.get("body")
        if not body:
            return {"statusCode": 404, "body": json.dumps("Error! Missing body!")}

        return handle_post_request(user_id, body)

    elif http_method == "PUT":
        body = event.get("body")
        if not body:
            return {"statusCode": 404, "body": json.dumps("Error! Missing body!")}

        return handle_put_request(user_id, body)

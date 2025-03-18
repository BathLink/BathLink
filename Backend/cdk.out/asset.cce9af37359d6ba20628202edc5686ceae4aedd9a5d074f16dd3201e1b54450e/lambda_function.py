import json
import boto3


dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")


endpoint = "/users/userId"


def lambda_handler(event, context):
    print("Event:", event)

    try:
        http_method = event.get("httpMethod")
        path = event.get("path")

        userId = path.split("/")[2]

        if http_method == "GET":
            rsp = users_table.get_item(
                Key={"userId": userId}  # The partition key used in the DynamoDB table
            )

            if "Item" in rsp:
                user_data = rsp["Item"]
                return {
                    "statusCode": 200,
                    "body": json.dumps(
                        user_data
                    ),  # Return the user data in the response
                }
            else:
                return {"statusCode": 404, "body": f"userId:{userId} not found!"}
        else:
            return {
                "statusCode": 500,
                "body": f"{http_method} not implemented for users yet",
            }

    except Exception as e:
        print(e)

        return {
            "statusCode": 500,
            "body": json.dumps({"message": "The server screwed up", "error": str(e)}),
        }

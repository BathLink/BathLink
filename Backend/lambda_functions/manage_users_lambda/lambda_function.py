import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")



endpoint = "/users/userId"


def PostConfirmation(event, context):
    user_attributes = event["request"]["userAttributes"]

    users_table.put_item(
        Item={
            "student-id": user_attributes.get('sub'),
            "email": user_attributes.get('email'),
            "phone": user_attributes.get('phone_number'),
            "name": user_attributes.get('given_name') + " " + user_attributes.get('family_name'),
            "calendar": {"busy": []},
            "dob": user_attributes.get('birthdate'),
            "profile": {},
            "matchPreferences": {"enabled": False, "activities": []}
        }
    )

    return event

def lambda_handler(event, context):
    if "triggerSource" in event and event["triggerSource"] == "PostConfirmation_ConfirmSignUp":
        return PostConfirmation(event, context)
    
    print("Event:", event)

    try:
        http_method = event.get("httpMethod")
        path = event.get("path")

        userId = path.split("/")[2]

        if http_method == "GET":
            rsp = users_table.get_item(
                Key={
                    "student-id": userId
                }  # The partition key used in the DynamoDB table
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


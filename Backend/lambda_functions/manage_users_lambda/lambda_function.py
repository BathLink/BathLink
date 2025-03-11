import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
users_table = dynamodb.Table("users-table")


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

import time

import boto3
import pytest
from botocore.exceptions import ClientError

USER_POOL_ID = "eu-west-2_rmKGv9RRx"
CLIENT_ID = "5749fbmbs7u5plqcs45itie053"
AWS_REGION = "eu-west-2"

# Initialize Cognito client
client = boto3.client("cognito-idp", region_name=AWS_REGION)
table = boto3.resource("dynamodb", region_name="eu-west-2").Table("users-table")


def sign_up_user(email, password, phone, given_name, family_name, birthdate):
    """Sign up a user with required attributes"""
    try:
        response = client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "phone_number", "Value": phone},
                {"Name": "given_name", "Value": given_name},
                {"Name": "family_name", "Value": family_name},
                {"Name": "birthdate", "Value": birthdate},
            ]
        )
        print(f"✅ User {email} signed up successfully:", response)
        return response
    except client.exceptions.UsernameExistsException:
        print(f"⚠️ Error: User {email} already exists")
    except client.exceptions.InvalidPasswordException as e:
        print(f"⚠️ Error: Invalid password - {e}")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")


def confirm_user(username):
    """Confirms a user's registration in Cognito."""
    try:
        response = client.admin_confirm_sign_up(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        print(f"✅ User {username} confirmed successfully.")
        return response
    except client.exceptions.UserNotFoundException:
        print(f"⚠️ Error: User {username} not found.")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")

def delete_user(username,id):
    """Deletes a user from Cognito"""
    try:
        response = client.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        table.delete_item(Key={"student-id": id})
        print(f"✅ User {username} deleted successfully.")
        return response
    except client.exceptions.UserNotFoundException:
        print(f"⚠️ Error: User {username} does not exist.")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")


def check_user_exists(username):
    try:
        response = client.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        # If the user exists, response will be returned
        return True
    except ClientError as e:
        # If user does not exist, error code 'UserNotFoundException' will be raised
        if e.response['Error']['Code'] == 'UserNotFoundException':
            return False
        else:
            raise e


@pytest.mark.parametrize(
    "email, password, phone, given_name, family_name, birthdate",
    [
        ("test@user.com", "Password123",  "+1234567890", "Test", "User", "1990-01-01"),
    ]
)
def test_sign_up(email, password, phone, given_name, family_name, birthdate):
    response = sign_up_user(email, password , phone, given_name, family_name, birthdate)
    id = response['UserSub']

    confirm_user(email)

    item = table.get_item(Key={"student-id": id})

    assert ("Item" in item) == True
    assert check_user_exists(id) == True

    delete_user(email,id)

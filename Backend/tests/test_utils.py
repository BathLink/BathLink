import boto3
import os

import pytest
import requests
from dotenv import load_dotenv

load_dotenv()

COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID", "5749fbmbs7u5plqcs45itie053")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "eu-west-2_rmKGv9RRx")
COGNITO_REGION = os.getenv("AWS_REGION", "eu-west-2")

TEST_USER = os.getenv("TEST_USER")
TEST_PASSWORD = os.getenv("TEST_PASSWORD")

client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
table = boto3.resource("dynamodb", region_name="eu-west-2").Table("users-table")

def get_cognito_token(username, password):
    """Authenticate with Cognito and return the access token."""

    response = client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={"USERNAME": username, "PASSWORD": password},
    )

    return response["AuthenticationResult"]["IdToken"]


def fetch_from_api(url: str, method: str = "GET"):
    token = get_cognito_token(TEST_USER, TEST_PASSWORD)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.request(method, url, headers=headers)
    return response

def post_from_api(url: str,data: dict):
    token = get_cognito_token(TEST_USER, TEST_PASSWORD)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers,json=data)
    return response

def put_from_api(url: str,data: dict):
    token = get_cognito_token(TEST_USER, TEST_PASSWORD)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.put(url, headers=headers, json=data)
    return response

def sign_up_user(email, password, phone, given_name, family_name, birthdate):
    """Sign up a user with required attributes"""
    try:
        response = client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
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
            UserPoolId=COGNITO_USER_POOL_ID,
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
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=username
        )
        table.delete_item(Key={"student-id": id})
        print(f"✅ User {username} deleted successfully.")
        return response
    except client.exceptions.UserNotFoundException:
        print(f"⚠️ Error: User {username} does not exist.")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")

def create_user(email, password, phone, given_name, family_name, birthdate):
    response = sign_up_user(email, password, phone, given_name, family_name, birthdate)
    id = response['UserSub']

    confirm_user(email)
    return id

@pytest.fixture(scope="module")
def create_test_user():
    id = create_user('testuser@email.com', 'Password123', '+1234567890', 'Test', 'User', '1990-01-01')

    yield id

    delete_user('testuser@email.com',id)
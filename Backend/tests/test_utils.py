import boto3
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID", "5749fbmbs7u5plqcs45itie053")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "eu-west-2_rmKGv9RRx")
COGNITO_REGION = os.getenv("AWS_REGION", "eu-west-2")

TEST_USER = os.getenv("TEST_USER")
TEST_PASSWORD = os.getenv("TEST_PASSWORD")


def get_cognito_token(username, password):
    """Authenticate with Cognito and return the access token."""
    client = boto3.client("cognito-idp", region_name=COGNITO_REGION)

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


def post_to_api(url: str, method: str = "POST", body: dict = {}):
    token = get_cognito_token(TEST_USER, TEST_PASSWORD)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.request(method, url, headers=headers, json=body)
    return response


# print(get_cognito_token(TEST_USER, TEST_PASSWORD))
print(
    post_to_api(
        "https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/12345678-abcd-1234-abcd-123456abcdef/profile",
        body={
            "social": "putchanged@bath.com",
            "description": "Neek",
            "pronouns": "he/her",
            "phone_number": "7819238213",
        },
    ).text
)

# print(
#     post_to_api(
#         "https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/chats/504",
#         body={
#             "meetupId": 123,
#             "messages": ["hello! excited to play?!", "i sure am !!!"],
#         },
#     ).text
# )

# 123, 7182

import boto3
import os

COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID", "")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "")
COGNITO_REGION = os.getenv("AWS_REGION", "us-west-2")


def get_cognito_token(username, password):
    """Authenticate with Cognito and return the access token."""
    client = boto3.client("cognito-idp", region_name=COGNITO_REGION)

    response = client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={"USERNAME": username, "PASSWORD": password},
    )

    return response["AuthenticationResult"]["AccessToken"]

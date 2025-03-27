import time

import boto3
import pytest
from botocore.exceptions import ClientError

from Backend.tests.test_utils import sign_up_user, confirm_user, delete_user, create_user

USER_POOL_ID = "eu-west-2_rmKGv9RRx"
CLIENT_ID = "5749fbmbs7u5plqcs45itie053"
AWS_REGION = "eu-west-2"

# Initialize Cognito client
client = boto3.client("cognito-idp", region_name=AWS_REGION)
table = boto3.resource("dynamodb", region_name="eu-west-2").Table("users-table")

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
    id = create_user(email, password, phone, given_name, family_name, birthdate)

    item = table.get_item(Key={"student-id": id})

    assert ("Item" in item) == True
    assert check_user_exists(id) == True

    delete_user(email,id)

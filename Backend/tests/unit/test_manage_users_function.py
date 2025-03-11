import pytest
import json
from moto import mock_aws
import boto3


@pytest.fixture
def dynamodb_setup():
    """Set up a mock DynamoDB table before each test."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
        table = dynamodb.create_table(
            TableName="users-table",
            KeySchema=[{"AttributeName": "student-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "student-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table


# Import lambda functions after initialising mocked dynamodb
from Backend.lambda_functions.manage_users_lambda.lambda_function import PostConfirmation


@pytest.mark.parametrize(
    "attributes",
    [
        {
             "sub": "12345678-abcd-1234-abcd-123456abcdef",
             "email": "testuser@example.com",
             "phone_number": "+1234567890",
             "given_name": "Test",
             "family_name": "User",
             "birthdate": "1990-01-01"
         }
    ]
)
def test_post_confirmation(dynamodb_setup, attributes):
    event = {
        "version": "1",
        "triggerSource": "PostConfirmation_ConfirmSignUp",
        "region": "us-west-2",
        "userPoolId": "eu-west-2_rmKGv9RRx",
        "userName": attributes["sub"],
        "callerContext": {
            "awsSdkVersion": "aws-sdk-js-2.953.0",
            "clientId": "5749fbmbs7u5plqcs45itie053"
        },
        "request": {
            "userAttributes": attributes
        },
        "response": {}
    }
    expected_response = {
             "student-id": attributes["sub"],
             "email": attributes["email"],
             "phone": attributes["phone_number"],
             "name": attributes["given_name"] + " " + attributes["family_name"],
             "calendar": {
                 "busy": []
             },
             "dob": attributes["birthdate"],
             "profile": {},
             "matchPreferences": {
                 "enabled": False,
                 "activities": []
             }
         }
    PostConfirmation(event, None)
    table = boto3.resource("dynamodb", region_name="eu-west-2").Table("users-table")
    item = table.get_item(Key={"student-id":attributes["sub"]})
    print(item)
    assert "Item" in item
    assert item["Item"] == expected_response

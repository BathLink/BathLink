import pytest
import json
from moto import mock_aws
import boto3

test_activity = {
    "activity-id": "001",
    "ability": "Beginner",
    "activity_name": "Tennis",
    "number_of_people": "2",
}


@pytest.fixture
def dynamodb_setup():
    """Set up a mock DynamoDB table before each test."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
        table = dynamodb.create_table(
            TableName="users-table",
            KeySchema=[{"AttributeName": "student-id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "student-id", "AttributeType": "S"}
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        table.put_item(
            Item={
                "student-id": "test-user-id",
                "calendar": {"available": []},
                "email": "test@test.com",
                "phone": "+123456789",
                "name": "Martin Power",
                "dob": "13/12/13",
                "profile": {
                    "social": [],
                    "description": "Tall basketballer",
                    "pronouns": "he/him",
                },
                "matchPreferences": {"enabled": False, "activities": ["001"]},
            }
        )
        yield table


from Backend.lambda_functions.manage_preferences_lambda.lambda_function import (
    lambda_handler,
)


def test_get_preferences(dynamodb_setup):
    event = {"httpMethod": "GET", "pathParameters": {"userId": "test-user-id"}}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"activities": ["001"], "enabled": False}


@pytest.mark.parametrize(
    "updatedPreferences, expected_status, expected_preferences",
    [
        ({"001": False}, 200, []),
        ({"003": False}, 200, ["001"]),
        ({"001": True}, 200, ["001"]),
        ({"002": True}, 200, ["001", "002"]),
        ({"002": True, "001": False}, 200, ["002"]),
    ],
)
def test_update_preferences(
    dynamodb_setup, updatedPreferences, expected_status, expected_preferences
):
    event = {
        "httpMethod": "PUT",
        "pathParameters": {"userId": "test-user-id"},
        "body": json.dumps(updatedPreferences),
    }

    response = lambda_handler(event, None)

    assert response["statusCode"] == expected_status

    response = lambda_handler(
        {"httpMethod": "GET", "pathParameters": {"userId": "test-user-id"}}, None
    )
    assert json.loads(response["body"])["activities"] == expected_preferences

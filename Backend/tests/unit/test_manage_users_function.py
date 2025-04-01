import pytest
import json
from moto import mock_aws
import boto3



@pytest.fixture
def dynamodb_setup():
    """Set up a mock DynamoDB table before each test."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
        user_table = dynamodb.create_table(
            TableName="users-table",
            KeySchema=[{"AttributeName": "student-id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "student-id", "AttributeType": "S"}
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        user_table.put_item(
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
                "matchPreferences": {"enabled": False, "activities": []},
            }
        )

        meetup_table = dynamodb.create_table(
            TableName="meetups-table",
            KeySchema=[{"AttributeName": "meetup-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "meetup-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        meetup_table.put_item(
            Item={
                "meetup-id": "001",
                "activity": "Boxing",
                "confirmed": True,
                "confirmed_users": ["test-user-id"],
                "done": False,
                "participants": [
                    "test-user-id",
                ],
                "time_slot": "2025-03-27 15:02:17",
            }
        )

        yield user_table,meetup_table




# Import lambda functions after initialising mocked dynamodb
from Backend.lambda_functions.manage_users_lambda.lambda_function import (
    PostConfirmation,
)
from Backend.lambda_functions.manage_users_lambda.lambda_function import lambda_handler


@pytest.mark.parametrize(
    "student_id, expected_status, expected_response",
    [
        (
            "test-user-id",
            200,
            {
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
                "matchPreferences": {"enabled": False, "activities": []},
            },
        ),
        ("nonexistent", 404, "userId:nonexistent not found!"),
    ],
)
@pytest.mark.benchmark(group="Manage Users")
def test_get_user(
    benchmark, dynamodb_setup, student_id, expected_status, expected_response
):
    event = {"path":f"/users/{student_id}","httpMethod": "GET", "pathParameters": {"userId": student_id}}

    response = benchmark(lambda_handler, event, None)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "student_id, body, expected_status, expected_response",
    [
        (
            "nonexistent",
            {"nonexistent_attribute": "hello"},
            404,
            "userId:nonexistent not found!",
        ),  # Non existent user error
        ("nonexistent", {}, 400, "Content of body is empty"),  # Body is empty error,
        (
            "nonexistent",
            {"nonexistent_attribute": "hello", "nonexistent_attribute2": "hello"},
            400,
            "Send only ONE value to update, not multiple",  # Multiple values were sent to update
        ),
        (
            "test-user-id",
            {"email": "google@apple.com"},
            200,
            "Success! Updated the record for user-id test-user-id, email=google@apple.com",  # successful image
        ),
    ],
)
@pytest.mark.benchmark(group="Manage Users")
def test_update_user(
    benchmark, dynamodb_setup, student_id, body, expected_status, expected_response
):
    event = {
        "httpMethod": "PUT",
        "pathParameters": {"userId": student_id},
        "body": body,
        "path": f"/users/{student_id}",
    }

    response = benchmark(lambda_handler, event, None)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "attributes",
    [
        {
            "sub": "12345678-abcd-1234-abcd-123456abcdef",
            "email": "testuser@example.com",
            "phone_number": "+1234567890",
            "given_name": "Test",
            "family_name": "User",
            "birthdate": "1990-01-01",
        }
    ],
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
            "clientId": "5749fbmbs7u5plqcs45itie053",
        },
        "request": {"userAttributes": attributes},
        "response": {},
    }
    expected_response = {
        "student-id": attributes["sub"],
        "email": attributes["email"],
        "phone": attributes["phone_number"],
        "name": attributes["given_name"] + " " + attributes["family_name"],
        "calendar": {"available": []},
        "dob": attributes["birthdate"],
        "profile": {},
        "matchPreferences": {"enabled": False, "activities": []},
    }
    PostConfirmation(event, None)
    table = boto3.resource("dynamodb", region_name="eu-west-2").Table("users-table")
    item = table.get_item(Key={"student-id": attributes["sub"]})
    assert "Item" in item
    assert item["Item"] == expected_response


def test_get_user_meetups(dynamodb_setup):
    event = {
        "httpMethod": "GET",
        "pathParameters": {"userId": "test-user-id"},
        "path": f"/users/test-user-id/meetups",
    }

    response = lambda_handler(event, None)
    print(response)
    assert response["statusCode"] == 200
    assert json.loads(response["body"])["meetups"] == [
        {
            "meetup-id": "001",
            "activity": "Boxing",
            "confirmed": True,
            "confirmed_users": ["test-user-id"],
            "done": False,
            "participants": ["test-user-id"],
            "time_slot": "2025-03-27 15:02:17",
        }
    ]

def test_invalid_method():
    event = {
        "httpMethod": "UNKNOWN",
        "pathParameters": {"userId": "test-user-id"},
        "path": f"/users/test-user-id/meetups",
    }

    response = lambda_handler(event, None)
    assert response["statusCode"] == 500
    assert response["body"] == "UNKNOWN does not exist for users"

def test_invalid_userId():

    event = {
        "httpMethod": "GET",
        "pathParameters": {"userId": ["test-user-id"]},
        "path": f"/users/test-user-id",
    }

    response = lambda_handler(event, None)
    assert response["statusCode"] == 500
    assert json.loads(response["body"]) == "The server screwed up, error: An error occurred (ValidationException) when calling the GetItem operation: The provided key element does not match the schema"
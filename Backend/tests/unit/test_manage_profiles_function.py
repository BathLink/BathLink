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
                    "social": {"instagram": "cr7"},
                    "description": "Tall basketballer",
                    "pronouns": "he/him",
                },
                "matchPreferences": {"enabled": False, "activities": []},
            }
        )
        yield table


from Backend.lambda_functions.manage_profiles_lambda.lambda_function import (
    lambda_handler,
)


@pytest.mark.parametrize(
    "student_id, expected_status, expected_response",
    [
        (
            "test-user-id",
            200,
            {
                "social": {"instagram": "cr7"},
                "description": "Tall basketballer",
                "pronouns": "he/him",
            },
        ),
        ("nonexistent", 404, "userId:nonexistent not found!"),
    ],
)
@pytest.mark.benchmark(group="Manage Profiles")
def test_get_profile(
    benchmark, dynamodb_setup, student_id, expected_status, expected_response
):
    event = {"httpMethod": "GET", "pathParameters": {"userId": student_id}}

    response = benchmark(lambda_handler, event, None)

    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "student_id, body, expected_status, expected_response",
    [
        ("nonexistent", {}, 404, "Error! Missing body!"),
        (
            "nonexistent",
            {"social": {}, "description": "", "pronouns": ""},
            404,
            "student-id nonexistent doesnt exist and so this POST has been cancelled",
        ),
        (
            "test-user-id",
            {
                "social": {"instagram": "cr8"},
                "description": "active guy",
                "pronouns": "she/her",
            },
            200,
            "Success! Updated test-user-id's profile",
        ),
    ],
)
@pytest.mark.benchmark(group="Manage Profiles")
def test_post_profile(
    benchmark, dynamodb_setup, student_id, body, expected_status, expected_response
):
    event = {
        "httpMethod": "POST",
        "pathParameters": {"userId": student_id},
        "body": body,
    }

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
            "student-id nonexistent doesnt exist and so this PUT has been cancelled",
        ),  # Non existent user error
        ("nonexistent", {}, 404, "Error! Missing body!"),  # Body is empty error,
        (
            "nonexistent",
            {"nonexistent_attribute": "hello", "nonexistent_attribute2": "hello"},
            404,
            "Send only ONE value to update, not multiple",  # Multiple values were sent to update
        ),
        (
            "test-user-id",
            {"description": "cricket enthusiast"},
            200,
            "Success! Updated test-user-id's profile's attribute description to cricket enthusiast",  # successful image
        ),
    ],
)
@pytest.mark.benchmark(group="Manage Profiles")
def test_update_profile(
    benchmark, dynamodb_setup, student_id, body, expected_status, expected_response
):
    event = {
        "httpMethod": "PUT",
        "pathParameters": {"userId": student_id},
        "body": body,
    }

    response = benchmark(lambda_handler, event, None)

    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response

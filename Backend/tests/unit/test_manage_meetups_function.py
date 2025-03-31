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
            TableName="meetups-table",
            KeySchema=[{"AttributeName": "meetup-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "meetup-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        table.put_item(
            Item={
                "meetup-id": "001",
                "activity": "Boxing",
                "confirmed": True,
                "confirmed_users": [{"S": "test-user-id"}],
                "done": False,
                "participants": [
                    {"S": "463252b4-c071-7011-ad55-29a0128416ba"},
                    {"S": "26225284-d0a1-7004-1e01-973773a6990f"},
                ],
                "time_slot": "2025-03-27 15:02:17",
            }
        )
        yield table


from Backend.lambda_functions.manage_meetups_lambda.lambda_function import (
    lambda_handler,
)


@pytest.mark.parametrize(
    "meetup_id, expected_status, expected_response",
    [
        ("nonexistent", 404, "meetupId:nonexistent not found!"),
        (
            "001",
            200,
            {
                "meetup-id": "001",
                "activity": "Boxing",
                "confirmed": True,
                "confirmed_users": [{"S": "test-user-id"}],
                "done": False,
                "participants": [
                    {"S": "463252b4-c071-7011-ad55-29a0128416ba"},
                    {"S": "26225284-d0a1-7004-1e01-973773a6990f"},
                ],
                "time_slot": "2025-03-27 15:02:17",
            },
        ),
    ],
)
@pytest.mark.benchmark(group="Manage Meetups")
def test_get_meetup(
    benchmark, dynamodb_setup, meetup_id, expected_status, expected_response
):
    event = {
        "httpMethod": "GET",
        "pathParameters": {"meetupId": meetup_id},
        "path": f"/meetups/{meetup_id}",
    }
    response = benchmark(lambda_handler, event, None)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "meetup_id, expected_status, expected_response",
    [
        ("nonexistent", 404, "meetupId:nonexistent not found!"),
        ("001", 200, "Successfully deleted meetup-id 001"),
    ],
)
def test_del_meetup(
    benchmark, dynamodb_setup, meetup_id, expected_status, expected_response
):
    event = {
        "httpMethod": "DELETE",
        "pathParameters": {"meetupId": meetup_id},
        "path": f"/meetups/{meetup_id}",
    }
    response = lambda_handler(
        event, None
    )  # Not doing benchmark cos once its deleted, its gone and it has to be reinserted which makes it fail
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "meetup_id, body, expected_status, expected_response",
    [
        (
            "",
            {"user_id": "something"},
            400,
            "Missing meetupId in path parameters",
        ),
        (
            "nonexistent",
            {},
            400,
            "Missing user_id in request body",
        ),
        (
            "nonexistent",
            {"user_id": "something"},
            404,
            "Meetup not found",
        ),
        (
            "001",
            {"user_id": "something"},
            200,
            "User something confirmed for meetup 001. Meetup is now confirmed.",
        ),
    ],
)
@pytest.mark.benchmark(group="Manage Meetups")
def test_update_meetup(
    benchmark, dynamodb_setup, meetup_id, body, expected_status, expected_response
):
    event = {
        "httpMethod": "PUT",
        "pathParameters": {"meetupId": meetup_id},
        "path": f"/meetups/{meetup_id}",
        "body": body,
    }
    response = benchmark(lambda_handler, event, None)
    print("HELOOOO")
    print(response["body"])
    print(expected_response)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response

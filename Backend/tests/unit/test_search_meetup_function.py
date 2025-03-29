import json
import pytest
from moto import mock_aws
import boto3

from Backend.lambda_functions.search_meetups_lambda import lambda_function as lf


@pytest.fixture
def setup_mock_dynamodb():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")

        users_table = dynamodb.create_table(
            TableName="users-table",
            KeySchema=[{"AttributeName": "student-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "student-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        activities_table = dynamodb.create_table(
            TableName="activities-table",
            KeySchema=[{"AttributeName": "activity-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "activity-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        meetups_table = dynamodb.create_table(
            TableName="meetups-table",
            KeySchema=[{"AttributeName": "meetup-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "meetup-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        yield users_table, activities_table, meetups_table


def test_handle_post_request_with_match(setup_mock_dynamodb):
    users_table, activities_table, _ = setup_mock_dynamodb

    # Add two users with matching availability & preferences
    users_table.put_item(Item={
        "student-id": "user1",
        "calendar": {"available": ["2025-03-30 15:00:00"]},
        "matchPreferences": {"activities": ["001"], "enabled": True}
    })

    users_table.put_item(Item={
        "student-id": "user2",
        "calendar": {"available": ["2025-03-30 15:00:00"]},
        "matchPreferences": {"activities": ["001"], "enabled": True}
    })

    activities_table.put_item(Item={
        "activity-id": "001",
        "number_of_people": "2",
        "activity_name": "Football"
    })

    response = lf.handle_post_request()
    assert response["statusCode"] == 200
    assert "Created 1 complete meetups" in json.loads(response["body"])


def test_lambda_handler_post_success(setup_mock_dynamodb):
    users_table, activities_table, _ = setup_mock_dynamodb

    users_table.put_item(Item={
        "student-id": "user1",
        "calendar": {"available": ["2025-03-30 15:00:00"]},
        "matchPreferences": {"activities": ["001"], "enabled": True}
    })

    users_table.put_item(Item={
        "student-id": "user2",
        "calendar": {"available": ["2025-03-30 15:00:00"]},
        "matchPreferences": {"activities": ["001"], "enabled": True}
    })

    activities_table.put_item(Item={
        "activity-id": "001",
        "number_of_people": "2",
        "activity_name": "Football"
    })

    event = {"httpMethod": "POST"}
    response = lf.lambda_handler(event, None)
    assert response["statusCode"] == 200
    assert "Created 1 complete meetups" in json.loads(response["body"])


def test_lambda_handler_invalid_method(setup_mock_dynamodb):
    event = {"httpMethod": "GET"}
    response = lf.lambda_handler(event, None)
    assert response["statusCode"] == 400
    assert "doesn't exist for meetups" in response["body"]

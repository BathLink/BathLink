import os

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
        table.put_item(Item={"student-id": "test-user-id","calendar":{"busy": []}})
        yield table

# Import lambda functions after initialising mocked dynamodb
from Backend.lambda_functions.manage_calendars_lambda.lambda_function import lambda_handler

@pytest.mark.parametrize(
    "user_id, expected_status, expected_response",
    [
        ("test-user-id", 200, {"busy": []}),
        ("nonexistent", 404, {"error": f"Cannot find user nonexistent"}),
    ]
)
@pytest.mark.benchmark(group='Manage Calendars')
def test_get_calendar(benchmark,dynamodb_setup,user_id, expected_status, expected_response):

    event = {
        "httpMethod":"GET",
        "pathParameters": {"userId":user_id}
    }
    response = benchmark(lambda_handler,event,None)

    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response

@pytest.mark.parametrize(
    "user_id, body, expected_status, expected_response",
    [
        ("test-user-id", {"calendarData": [{"start": "2025-03-01T10:00", "end": "2025-03-01T12:00"}]}, 200, {'message': 'Calendar updated with new data'}),
        ("test-user-id", {}, 400, {"error":"No calendar data provided"}),
        ("nonexistent", {"calendarData": [{"start": "2025-03-01T10:00", "end": "2025-03-01T12:00"}]}, 404, {"error": f"Cannot find user nonexistent"}),
    ]
)
@pytest.mark.benchmark(group='Manage Calendars')
def test_post_calendar(benchmark,dynamodb_setup,user_id, body ,expected_status, expected_response):
    event = {
        "httpMethod": "POST",
        "pathParameters": {"userId": user_id},
        "body": body,
    }
    response = benchmark(lambda_handler, event, None)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


@pytest.mark.parametrize(
    "user_id, expected_status, expected_response",
    [
        ("test-user-id", 200, {"message": "Calendar cleared"}),
        ("nonexistent", 404, {"error": f"Cannot find user nonexistent"}),
    ]
)
def test_delete_calendar(dynamodb_setup,user_id ,expected_status, expected_response):
    event = {
        "httpMethod": "DELETE",
        "pathParameters": {"userId": user_id},
    }
    response = lambda_handler(event,None)
    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response


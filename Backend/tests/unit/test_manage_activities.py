
import pytest
import json
from moto import mock_aws
import boto3

test_activity = {
 "activity-id": "001",
 "ability": "Beginner",
 "activity_name": "Tennis",
 "number_of_people": "2"
}

@pytest.fixture
def dynamodb_setup():
    """Set up a mock DynamoDB table before each test."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
        table = dynamodb.create_table(
            TableName="activities-table",
            KeySchema=[{"AttributeName": "activity-id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "activity-id", "AttributeType": "S"}
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        table.put_item(
            Item=test_activity
        )
        yield table


from Backend.lambda_functions.manage_activities_lambda.lambda_function import (
    lambda_handler,
)


@pytest.mark.parametrize(
    "activity_id, expected_status, expected_response",
    [
        ("001", 200, test_activity),
        ("nonexistent", 404, "activityId:nonexistent not found!"),
    ],
)

def test_get_activity(
    dynamodb_setup, activity_id, expected_status, expected_response
):
    event = {"httpMethod": "GET", "pathParameters": {"activityId": activity_id}}

    response = lambda_handler(event,None)

    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response

def test_get_all_activities(dynamodb_setup):
    event = {"httpMethod": "GET"}

    response = lambda_handler(event,None)

    assert response["statusCode"] == 200
    assert all(["activity-id" in activity for activity in json.loads(response["body"])])





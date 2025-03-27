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
            KeySchema=[{"AttributeName": "chat-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "chat-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )

        table.put_item(
            Item={
                "chat-id": "100",
                "meetup-id": "200",
                "messages": [
                    {"userId": "test-user-id", "content": "alr", "time": "10/25/90"}
                ],
            }
        )
        yield table


from Backend.lambda_functions.manage_chats_lambda.lambda_function import lambda_handler


@pytest.mark.parametrize(
    "chat_id, expected_status, expected_response",
    [
        (
            "100",
            200,
            {
                "chat-id": "100",
                "meetup-id": "200",
                "messages": [
                    {"userId": "test-user-id", "content": "alr", "time": "10/25/90"}
                ],
            },
        ),
        ("200", 404, "chatId:200 not found!"),
    ],
)
@pytest.mark.benchmark(group="Manage Chats")
def test_get_chat(
    benchmark, dynamodb_setup, chat_id, expected_status, expected_response
):
    event = {"httpMethod": "GET", "pathParameters": {"chatId": chat_id}}

    response = benchmark(lambda_handler, event, None)

    print("HELOOOOOOOOOOO!")
    print(response)

    assert response["statusCode"] == expected_status
    assert json.loads(response["body"]) == expected_response

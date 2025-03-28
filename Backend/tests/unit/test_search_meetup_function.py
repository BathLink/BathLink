import json
import uuid
import pytest
import boto3
from moto import mock_aws

# Import your module here (replace with the actual name)
import Backend.lambda_functions.search_meetups_lambda.lambda_function as m

@pytest.fixture(autouse=True)
def aws_credentials():
    """Mocked AWS credentials for moto."""
    import os
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "eu-west-2"

@pytest.fixture
def dynamodb_setup():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")

        users_table = dynamodb.create_table(
            TableName="users-table",
            KeySchema=[{"AttributeName": "student-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "student-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        meetups_table = dynamodb.create_table(
            TableName="meetups-table",
            KeySchema=[{"AttributeName": "meetup_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "meetup_id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        activities_table = dynamodb.create_table(
            TableName="activities-table",
            KeySchema=[{"AttributeName": "activity_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "activity_id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        # Patch globals
        m.users_table = users_table
        m.meetups_table = meetups_table
        m.activities_table = activities_table

        def mock_get_users():
            return [
                {
                    "student-id": "u1",
                    "calendar": {"busy": ["Monday 9AM"]},
                    "matchPreferences": {"activities": ["a1"], "enabled": True},
                    "ongoing_meetups": 0
                },
                {
                    "student-id": "u2",
                    "calendar": {"busy": ["Monday 9AM"]},
                    "matchPreferences": {"activities": ["a1"], "enabled": True},
                    "ongoing_meetups": 0
                }
            ]
        m.get_matching_users = mock_get_users
        yield {
            "users": m.users_table,
            "meetups": m.meetups_table,
            "activities": m.activities_table,
        }

def test_get_activity_ids():
    users = [
        {"matchPreferences": {"activity_id": ["a1", "a2"]}},
        {"matchPreferences": {"activity_id": ["a2", "a3"]}},
    ]
    assert sorted(m.get_activity_ids(users)) == ["a1", "a2", "a3"]

def test_group_users_by_time_slot():
    users = [
        {"student-id": "u1", "calendar": ["t1"], "matchPreferences": {"activity_id": ["a1"]}},
        {"student-id": "u2", "calendar": ["t1"], "matchPreferences": {"activity_id": ["a1", "a2"]}},
    ]
    activities = {"a1": {"number_of_people": "2"}, "a2": {"number_of_people": "2"}}
    groups = m.group_users_by_time_slot(users, activities)
    assert "t1" in groups
    assert groups["t1"]["a1"] == ["u1", "u2"]
    assert groups["t1"]["a2"] == ["u2"]

def test_create_meetups_from_groups():
    groups = {
        "Monday 9AM": {
            "a1": ["u1", "u2", "u3"]
        }
    }
    activities = {"a1": {"number_of_people": "2"}}
    meetups = m.create_meetups_from_groups(groups, activities)
    assert len(meetups) == 1 or len(meetups) == 2  # Should create up to 1 or 2 full groups
    for m_up in meetups:
        assert m_up["activity_id"] == "a1"
        assert len(m_up["participants"]) == 2

def test_store_meetups(dynamodb_setup):
    meetup = {
        "meetup_id": "m1",
        "activity_id": "a1",
        "participants": ["u1", "u2"],
        "time_slot": "Monday 9AM",
        "confirmed": False,
        "done": False,
        "confirmed_users": []
    }
    m.store_meetups([meetup])
    result = dynamodb_setup["meetups"].get_item(Key={"meetup_id": "m1"})
    assert result["Item"]["activity_id"] == "a1"

def test_lambda_handler_success(dynamodb_setup):
    dynamodb_setup["activities"].put_item(Item={"activity_id": "a1", "number_of_people": "2"})
    response = m.lambda_handler({"httpMethod": "POST"}, None)
    assert response["statusCode"] == 200
    assert "Created" in json.loads(response["body"])

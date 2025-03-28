import pytest
import json
import boto3
from moto import mock_aws

import Backend.lambda_functions.search_meetups_lambda.lambda_function as m


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
            KeySchema=[{"AttributeName": "meetup-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "meetup-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        activities_table = dynamodb.create_table(
            TableName="activities-table",
            KeySchema=[{"AttributeName": "activity-id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "activity-id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        m.users_table = users_table
        m.meetups_table = meetups_table
        m.activities_table = activities_table

        yield {
            "users": users_table,
            "meetups": meetups_table,
            "activities": activities_table,
        }

def test_get_activity_ids():
    users = [
        {"matchPreferences": {"activity-id": ["a1", "a2"]}},
        {"matchPreferences": {"activity-id": ["a2", "a3"]}},
    ]
    assert sorted(m.get_activity_ids(users)) == ["a1", "a2", "a3"]

def test_get_activities_correct_table(dynamodb_setup):
    activities_table = dynamodb_setup["activities"]
    activities_table.put_item(Item={"activity-id": "a1", "number_of_people": "2", "activity_name": "Football"})
    m.activities_table = activities_table

    result = m.get_activities(["a1"])
    assert "a1" in result
    assert result["a1"]["activity_name"] == "Football"

def test_group_users_by_time_slot():
    users = [
        {"student-id": "u1", "calendar": ["slot1"], "matchPreferences": {"activity-id": ["a1"]}},
        {"student-id": "u2", "calendar": ["slot1"], "matchPreferences": {"activity-id": ["a1", "a2"]}},
    ]
    activities = {"a1": {"number_of_people": "2"}, "a2": {"number_of_people": "2"}}
    result = m.group_users_by_time_slot(users, activities)
    assert result["slot1"]["a1"] == ["u1", "u2"]
    assert result["slot1"]["a2"] == ["u2"]

def test_create_meetups_respects_group_size():
    matches = {"slot1": {"a1": ["u1", "u2", "u3"]}}
    activities = {"a1": {"number_of_people": "2"}}
    meetups = m.create_meetups_from_groups(matches, activities)
    assert all(len(mtg["participants"]) == 2 for mtg in meetups)
    assert len(meetups) == 1 or len(meetups) == 2

def test_store_meetups(dynamodb_setup):
    meetups_table = dynamodb_setup["meetups"]
    m.meetups_table = meetups_table
    sample_meetup = {
        "meetup-id": "m1",
        "activity-id": "a1",
        "participants": ["u1", "u2"],
        "time_slot": "slot1",
        "confirmed": False,
        "done": False,
        "confirmed_users": []
    }
    m.store_meetups([sample_meetup])
    item = meetups_table.get_item(Key={"meetup-id": "m1"})
    assert item["Item"]["activity-id"] == "a1"

def test_lambda_handler_post_success(dynamodb_setup):
    users_table = dynamodb_setup["users"]
    activities_table = dynamodb_setup["activities"]
    meetups_table = dynamodb_setup["meetups"]

    users_table.put_item(Item={
        "student-id": "u1",
        "calendar": ["slot1"],
        "matchPreferences": {"activity-id": ["a1"]},
        "Enabled": True
    })
    users_table.put_item(Item={
        "student-id": "u2",
        "calendar": ["slot1"],
        "matchPreferences": {"activity-id": ["a1"]},
        "Enabled": True
    })

    activities_table.put_item(Item={"activity-id": "a1", "number_of_people": "2"})

    m.users_table = users_table
    m.activities_table = activities_table
    m.meetups_table = meetups_table

    response = m.lambda_handler({"httpMethod": "POST"}, None)
    assert response["statusCode"] == 200
    assert "Created" in json.loads(response["body"])

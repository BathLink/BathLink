import json

import pytest
from Backend.tests.test_utils import (
    fetch_from_api,
    post_from_api,
    put_from_api,
)


def test_meetups():

    response = fetch_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/meetups/001"
    )

    print(json.loads(response.text))

    assert response.status_code == 200
    assert json.loads(response.text) == {
        "activity": "Boxing",
        "participants": [
            "463252b4-c071-7011-ad55-29a0128416ba",
            "26225284-d0a1-7004-1e01-973773a6990f",
        ],
        "confirmed": True,
        "time_slot": "2025-03-27 15:02:17",
        "meetup-id": "001",
        "done": False,
        "confirmed_users": ["26225284-d0a1-7004-1e01-973773a6990f", "001"],
    }

    response = put_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/meetups/001",
        data={"userId": "001"},
    )

    print(json.loads(response.text))

    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == "User 001 confirmed for meetup 001. Meetup is now confirmed."
    )

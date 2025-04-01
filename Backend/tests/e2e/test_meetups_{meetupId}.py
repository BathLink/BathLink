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
        'activity': 'Table Tennis',
         'confirmed': False,
         'confirmed_users': ['26225284-d0a1-7004-1e01-973773a6990f',
                             '86a24204-60b1-70a8-98b9-5ba0c389b2ea',
                             '001'],
         'done': False,
         'meetup-id': '001',
         'participants': ['86a24204-60b1-70a8-98b9-5ba0c389b2ea',
                          '26225284-d0a1-7004-1e01-973773a6990f'],
         'time_slot': '2025-03-27 15:02:17'
                                         }

    response = put_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/meetups/001",
        data={"userId": "001"},
    )

    print(json.loads(response.text))

    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == "User 001 confirmed for meetup 001."
    )

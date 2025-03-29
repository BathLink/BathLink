import json

import pytest
from Backend.tests.test_utils import (
    fetch_from_api,
    create_test_user,
    post_from_api,
    put_from_api,
)


def test_create_profile(create_test_user):

    user_id, username, password = create_test_user

    response = fetch_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}"
    )

    assert response.status_code == 200
    assert json.loads(response.text) == {
        "student-id": user_id,
        "dob": "1990-01-01",
        "profile": {},
        "matchPreferences": {"enabled": False, "activities": []},
        "calendar": {"available": []},
        "email": "testuser@email.com",
        "phone": "+1234567890",
        "name": "Test User",
    }

    response = put_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}",
        data={"dob": "2000-05-05"},
    )
    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == f"Success! Updated the record for user-id {user_id}, dob=2000-05-05"
    )

    response = put_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}",
        data={"dob": "2000-05-05", "email": "email@com"},
    )

    assert response.status_code == 400
    assert json.loads(response.text) == "Send only ONE value to update, not multiple"

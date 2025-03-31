import requests
import json
from Backend.tests.test_utils import create_test_user

def test_integration_users(create_test_user):
    user_id,username,password = create_test_user

    response = requests.get(
        f"http://127.0.0.1:3000/users/{user_id}"
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

    response = requests.put(
        f"http://127.0.0.1:3000/users/{user_id}",
        json={"dob": "2000-05-05"},
    )
    print(response.text)
    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == f"Success! Updated the record for user-id {user_id }, dob=2000-05-05"
    )

    response = requests.put(
        f"http://127.0.0.1:3000/users/{user_id}",
        json={"dob": "2000-05-05", "email": "email@com"},
    )

    assert response.status_code == 400
    assert json.loads(response.text) == "Send only ONE value to update, not multiple"


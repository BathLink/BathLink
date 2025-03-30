import json

import requests

from Backend.tests.test_utils import create_test_user


def test_preferences(create_test_user):
    user_id, username, password = create_test_user
    response = requests.get(f"http://127.0.0.1:3000/users/{user_id}/preferences")
    assert response.status_code == 200
    assert json.loads(response.text)["activities"] == []

    response = requests.put(f"http://127.0.0.1:3000/users/{user_id}/preferences",json={"001":True,"002":False,"003":True})
    assert response.status_code == 200

    response = requests.get(f"http://127.0.0.1:3000/users/{user_id}/preferences")
    assert response.status_code == 200
    assert set(json.loads(response.text)["activities"]) == {"001", "003"}

    response = requests.put(f"http://127.0.0.1:3000/users/{user_id}/preferences",json={"001":False})
    assert response.status_code == 200

    response = requests.get(f"http://127.0.0.1:3000/users/{user_id}/preferences")
    assert response.status_code == 200
    assert json.loads(response.text)["activities"] == ["003"]
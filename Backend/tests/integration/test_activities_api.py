import json

import requests


def test_get_specific_activity():
    response = requests.get("http://127.0.0.1:3000/activities/001")
    print(response.text)
    assert response.status_code == 200
    assert json.loads(response.text) == {
        "activity-id": '001',
        "ability": "Beginner",
        "activity_name": "Tennis",
        "number_of_people": '2',
    }

def test_get_all_activities():
    response = requests.get("http://127.0.0.1:3000/activities")
    assert response.status_code == 200
    assert all(["activity-id" in activity for activity in json.loads(response.text)])
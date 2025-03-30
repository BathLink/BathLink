import json
from Backend.tests.test_utils import fetch_from_api


def test_get_specific_activity():
    response = fetch_from_api("https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/activities/7b1fe750")
    assert response.status_code == 200
    assert json.loads(response.text) == {
        "activity-id": '7b1fe750',
        "ability": "Advanced",
        "activity_name": "Darts",
        "number_of_people": '2',
    }

def test_get_all_activities():
    response = fetch_from_api("https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/activities")
    assert response.status_code == 200
    assert all(["activity-id" in activity for activity in json.loads(response.text)])
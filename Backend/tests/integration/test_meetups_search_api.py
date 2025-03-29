import json
import requests


def test_integration_meetup_matching():
    # Trigger the matchmaking logic (e.g. POST to /meetups/search)
    response = requests.post(f"http://127.0.0.1:3000/search-meetups",data={})
    print("Lambda Response:", response.status_code, response.text)
    assert response.status_code == 200
    assert "Created" in json.loads(response.text)

import json
import pytest
from Backend.tests.test_utils import post_from_api, fetch_from_api

def test_e2e_meetup_matching():
    # Trigger the matchmaking logic (e.g. POST to /meetups/search)
    response = post_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/meetups/search", data={})
    print("Lambda Response:", response.status_code, response.text)
    assert response.status_code == 200
    assert "Created" in json.loads(response.text)

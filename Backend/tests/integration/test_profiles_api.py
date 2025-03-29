import json

import pytest
import requests
from Backend.tests.test_utils import create_integration_test_user


def test_integration_create_profile(create_integration_test_user):


    response = requests.post(f" http://127.0.0.1:3000/users/{create_integration_test_user}/profile", json={"social": "link to social", "description": "This is a description", "pronouns": "he/him"})
    assert response.status_code == 200

    response = requests.get(f"http://127.0.0.1:3000/users/{create_integration_test_user}/profile")
    assert response.status_code == 200
    assert json.loads(response.text) == {"social": "link to social", "description": "This is a description", "pronouns": "he/him"}


    response = requests.put(f"http://127.0.0.1:3000/users/{create_integration_test_user}/profile", json={"social": "new link to social"})
    assert response.status_code == 200

    response = requests.get(f"http://127.0.0.1:3000/users/{create_integration_test_user}/profile")
    assert response.status_code == 200
    assert json.loads(response.text) == {"social": "new link to social", "description": "This is a description", "pronouns": "he/him"}
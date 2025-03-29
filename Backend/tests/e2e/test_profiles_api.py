import json

import pytest
from Backend.tests.test_utils import fetch_from_api, create_test_user, post_from_api, put_from_api


def test_create_profile(create_test_user):

    response = post_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile", {"social": "link to social", "description": "This is a description", "pronouns": "he/him"})
    assert response.status_code == 200

    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile")
    assert response.status_code == 200
    assert json.loads(response.text) == {"social": "link to social", "description": "This is a description", "pronouns": "he/him"}

    response = put_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile", {"social": "new link to social"})
    assert response.status_code == 200

    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile")
    assert response.status_code == 200
    assert json.loads(response.text) == {"social": "new link to social", "description": "This is a description", "pronouns": "he/him"}
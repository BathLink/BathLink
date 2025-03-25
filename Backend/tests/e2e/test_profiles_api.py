import pytest
from Backend.tests.test_utils import fetch_from_api, create_test_user, post_from_api


def test_create_profile(create_test_user):

    response = post_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile", {"social": "link to social", "description": "This is a description", "pronouns": "he/him"})
    print(response.text)
    assert response.status_code == 200

    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{create_test_user}/profile")
    print(response.text)
    assert response.status_code == 200
    assert response.text == '{"social": "link to social", "description": "This is a description", "pronouns": "he/him"}'

import json
from Backend.tests.test_utils import fetch_from_api, create_test_user, put_from_api


def test_preferences(create_test_user):
    user_id, username, password = create_test_user
    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}/preferences")
    print(response.text)
    assert response.status_code == 200
    assert json.loads(response.text)["activities"] == []

    response = put_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}/preferences",{"001":True,"002":False,"003":True})
    assert response.status_code == 200

    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}/preferences")
    assert response.status_code == 200
    assert set(json.loads(response.text)["activities"]) == {"001", "003"}

    response = put_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}/preferences",{"001":False})
    assert response.status_code == 200

    response = fetch_from_api(f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/users/{user_id}/preferences")
    assert response.status_code == 200
    assert json.loads(response.text)["activities"] == ["003"]
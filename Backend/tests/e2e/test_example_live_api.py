import requests

API_URL = "https://pse8lxiuf2.execute-api.eu-west-2.amazonaws.com/prod/"


def test_example_live_api():
    response = requests.get(f"{API_URL}")
    assert response.status_code == 200

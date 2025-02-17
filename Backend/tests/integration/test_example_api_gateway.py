import requests

API_URL = "http://127.0.0.1:3000"


def test_api_gateway():
    response = requests.get(API_URL)
    print(response)
    assert response.status_code == 200

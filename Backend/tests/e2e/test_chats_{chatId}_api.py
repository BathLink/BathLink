import requests

from Backend.tests.test_utils import fetch_from_api

API_URL = "https://pse8lxiuf2.execute-api.eu-west-2.amazonaws.com/prod/chats"


def test_example_1():
    print(fetch_from_api("https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/chats/7686876").text)
    assert True

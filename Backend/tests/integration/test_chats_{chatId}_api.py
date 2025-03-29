import json
import random
import string

import requests


def test_integration_create_chats():

    random_chatid = "".join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)
    )

    response = requests.post(
        f"http://127.0.0.1:3000/chats/{random_chatid}",
        json={
            "meetupId": "test",
            "messages": [
                {"userId": "test-user-id", "content": "alr", "time": "10/25/90"}
            ],
        },
    )


    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == f"Success! Created a new record for chat-id {random_chatid}"
    )

    response = requests.post(
        f" http://127.0.0.1:3000/chats/{random_chatid}",
        json={
            "meetupId": "test",
            "messages": [
                {"userId": "test-user-id", "content": "new msg", "time": "10/25/80"}
            ],
        },
    )

    assert response.status_code == 200
    assert (
        json.loads(response.text)
        == f"Success! Updated the record for chat-id {random_chatid}"
    )

    response = requests.get(
        f" http://127.0.0.1:3000/chats/{random_chatid}"
    )

    assert response.status_code == 200
    assert json.loads(response.text) == {
        "chat-id": random_chatid,
        "meetup-id": "test",
        "messages": [
            {"userId": "test-user-id", "content": "alr", "time": "10/25/90"},
            {"userId": "test-user-id", "content": "new msg", "time": "10/25/80"},
        ],
    }


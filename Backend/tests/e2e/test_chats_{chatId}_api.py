import json

import pytest
from Backend.tests.test_utils import (
    fetch_from_api,
    post_from_api,
    put_from_api,
)


def test_create_profile():
    import random
    import string

    random_chatid = "".join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)
    )

    response = post_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/chats/{random_chatid}",
        {
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

    response = post_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/chats/{random_chatid}",
        {
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

    response = fetch_from_api(
        f"https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/chats/{random_chatid}"
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

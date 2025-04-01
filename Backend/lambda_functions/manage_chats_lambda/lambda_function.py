import json
import boto3

dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
chats_table = dynamodb.Table("groupchats-table")


def handle_get_request(chat_id):
    rsp = chats_table.get_item(Key={"chat-id": chat_id})

    if "Item" in rsp:
        chat_data = rsp["Item"]
        return {
            "statusCode": 200,
            "body": json.dumps(chat_data),  # Return the chat data in the response
        }
    else:
        return {
            "statusCode": 404,
            "body": json.dumps(f"chatId:{chat_id} not found!"),
        }


def handle_post_request(chat_id, body):

    if type(body) == str:
        data = json.loads(body)
    else:
        data = body

    meetup_id = data["meetupId"]
    messages = data["messages"]

    # print(f"chatid:{chat_id}, meetupid:{meetup_id}, message:{messages}")

    chat_rsp = chats_table.get_item(Key={"chat-id": chat_id})
    # print(type(chat_rsp))
    # print("chat_rsp", chat_rsp)
    if "Item" not in chat_rsp:
        # If its the first time that the chat-id is getting input
        print(f"chat-id {chat_id} didnt exist before")
        rsp = chats_table.put_item(
            Item={
                "chat-id": chat_id,
                "meetup-id": str(meetup_id),
                "messages": messages,
            }
        )

        return {
            "statusCode": 200,
            "body": json.dumps(
                f"Success! Created a new record for chat-id {chat_id}"
            ),
            "headers": {"Content-Type": "application/json"},
        }
    else:
        print(f"chat-id {chat_id} did exist before so just appeneded")

        # If chat-id already exists and messages are just getting appended
        item = chat_rsp["Item"]
        item["messages"].extend(messages)

        chats_table.put_item(Item=item)
        return {
            "statusCode": 200,
            "body": json.dumps(
                f"Success! Updated the record for chat-id {chat_id}"
            ),
            "headers": {"Content-Type": "application/json"},
        }




def lambda_handler(event, context):
    try:
        http_method = event["httpMethod"]
        path_parameters = event.get("pathParameters", {})
        chat_id = path_parameters.get("chatId")

        if not chat_id:
            return {
                "statusCode": 400,
                "body": json.dumps("Missing chatId in path parameters"),
            }

        if http_method == "GET":
            return handle_get_request(chat_id)

        elif http_method == "POST":
            body = event.get("body")
            if not body:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Content of body missing"),
                }
            else:
                return handle_post_request(chat_id, body)
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": json.dumps(f"error: {e}")}

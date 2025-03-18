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
        return {"statusCode": 404, "body": f"chatId:{chat_id} not found!"}


def handle_post_request(chat_id, body):
    try:
        data = json.loads(body)
        meetup_id = data["meetupId"]
        messages = data["messages"]

        chat_rsp = chats_table.get_item(Key={"chat-id": chat_id})
        if (
            "Item" not in chat_rsp
        ):  # If its the first time that the chat-id is getting input
            rsp = chats_table.put_item(
                Item={"chat-id": chat_id, "meetup-id": meetup_id, "messages": messages}
            )
        else:
            # To implement
            item = chat_rsp["Item"]
            item["messages"].extend(messages)
            chats_table.put_item(Item=item)

    except Exception as e:
        return {"statusCode": 400, "body": f"error: {e}"}


def lambda_handler(event, context):
    http_method = event["httpMethod"]
    path_parameters = event.get("pathParameters", {})
    chat_id = path_parameters.get("chatId")

    if not chat_id:
        return {"statusCode": 400, "body": "Missing chatId in path parameters"}

    if http_method == "GET":
        return handle_get_request(chat_id)

    elif http_method == "POST":
        body = event.get("body")
        if not body:

            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Content of body missing"}),
            }
        else:
            handle_post_request(chat_id, body)

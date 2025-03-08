import json
import boto3

dynamodb = boto3.resource("dynamodb",region_name="eu-west-2")
table = dynamodb.Table("chats")

def GET(event):
    #add userId verification to ensure secure chats
    chat_id = event.get("pathParameters").get("chatId")
    if not chat_id:
        return {"statusCode": 400, "body": json.dumps({"error": "chatId is required"})}
    
    response = table.get_item(Key={"chatId":chat_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "Chat not found"})}
    else:
        return {"statusCode": 200, "body": json.dumps(response["Item"])}

def POST(event):
    body = json.loads(event.get("body", "{}"))
    if not body:
        return {"statusCode": 400, "body": json.dumps({"error": "request body is missing"})}
    try:
        body = json.loads(event["body"])
    except json.JSONDecodeError:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}
    user_id = body.get("userId")
    participants = body.get("participants")
    if not user_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing userId"})}
        
    if not participants or not isinstance(participants, list):
        return {"statusCode": 400, "body": json.dumps({"error": "Missing or invalid 'participants' field"})}
    

    chat_id = generate_chat_id
    chat_item = {"chat_id" : chat_id, "user_id": user_id , "participants": participants, "messages" : []}
    table.put_item(Item=chat_item)
    return {
            "statusCode": 200,
            "body": json.dumps({"message": "Chat created", "chatId": chat_id})}

def generate_chat_id(user_id):
    response = table.scan(
            FilterExpression="begins_with(chatId, :user_id)",
            ExpressionAttributeValues={":user_id": user_id}
        )
    existing_chats = response.get("Items", [])
    next_chat_number = len(existing_chats) + 1
    chat_id = f"{user_id}{next_chat_number}"
    return chat_id


def DELETE(event):
    chat_id = event.get("pathParameters").get("chatId")
    if not chat_id:
        return {"statusCode": 400, "body": json.dumps({"error": "chatId is required"})}
    response = table.get_item(Key={"chatId":chat_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "Chat not found"})}
    else:
        table.delete_item(Key={"chatId": chat_id})
        return {"statusCode": 200, "body": json.dumps(response["Item"])}


routes = {  
    "GET": GET, 
    "POST": POST,
    "DELETE": DELETE
}

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    routes.get([http_method], lambda e : {"statusCode": 501, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "Http method not allowed"})
        })(event)

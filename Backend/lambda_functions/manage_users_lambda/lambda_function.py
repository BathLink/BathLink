import json
import boto3

dynamodb = boto3.resource("dynamodb",region_name="eu-west-2")
table = dynamodb.Table("users")

def GET(event):
    #add userId verification to ensure secure chats
    user_id = event.get("pathParameters").get("userId")
    if not user_id:
        return {"statusCode": 400, "body": json.dumps({"error": "userId is required"})}
    
    response = table.get_item(Key={"userId":user_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "User not found"})}
    else:
        return {"statusCode": 200, "body": json.dumps(response["Item"])}

def PUT(event):
    #need to do sign_up first to see what attributes can be updated
    return {"statusCode": 501, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "PUT not yest implemented"})
        }



def DELETE(event):
    user_id = event.get("pathParameters").get("userId")
    if not user_id:
        return {"statusCode": 400, "body": json.dumps({"error": "userId is required"})}
    response = table.get_item(Key={"userId":user_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "User not found"})}
    else:
        table.delete_item(Key={"userId": user_id})
        return {"statusCode": 200, "body": json.dumps(response["Item"])}


routes = {  
    "GET": GET, 
    "PUT": PUT,
    "DELETE": DELETE
}

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    routes.get([http_method], lambda e : {"statusCode": 501, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "Http method not allowed"})
        })(event)

import json
import boto3
#use uuid
dynamodb = boto3.resource("dynamodb",region_name="eu-west-2")
table = dynamodb.Table("meetups")

def GET(event): 
    meetup_id = event.get("pathParameters").get("meetupId")
    if not meetup_id:
        return {"statusCode": 400, "body": json.dumps({"error": "meetupId is required"})}
    
    response = table.get_item(Key={"meetupId":meetup_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "Meetup not found"})}
    else:
        return {"statusCode": 200, "body": json.dumps(response["Item"])}

def POST(event):
    #trigger chat creation
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
    

    meetup_id = generate_meetup_id
    meetup_item = {"meetup_id" : meetup_id, "participants": participants, "meetup_info" : []}
    table.put_item(Item=meetup_item)
    return {
            "statusCode": 200,
            "body": json.dumps({"message": "meetup created", "meetupId": meetup_id})}

def generate_meetup_id(user_id):
    #need more info as meetup id should be same for all participants
    meetup_id = 0
    return meetup_id


def DELETE(event):
    meetup_id = event.get("pathParameters").get("meetupId")
    if not meetup_id:
        return {"statusCode": 400, "body": json.dumps({"error": "meetupId is required"})}
    response = table.get_item(Key={"meetupId":meetup_id})

    if "Item" not in response:
        return {"statusCode": 404, "body": json.dumps({"error": "meetup not found"})}
    else:
        table.delete_item(Key={"meetupId": meetup_id})
        return {"statusCode": 200, "body": json.dumps(response["Item"])}
    
def PUT(event):
    #not sure what to put here
    return None

routes = {  
    "GET": GET, 
    "POST": POST,
    "DELETE": DELETE,
    "PUT" : PUT
}

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    routes.get([http_method], lambda e : {"statusCode": 501, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "Http method not allowed"})
        })(event)

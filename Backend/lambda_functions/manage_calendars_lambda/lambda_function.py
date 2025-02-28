import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("user-calendars")


#{"body": null, "headers": {"Accept": "*/*", "Host": "127.0.0.1:3001", "User-Agent": "curl/8.7.1", "X-Forwarded-Port": "3001", "X-Forwarded-Proto": "http"}, "httpMethod": "GET", "isBase64Encoded": false, "multiValueHeaders": {"Accept": ["*/*"], "Host": ["127.0.0.1:3001"], "User-Agent": ["curl/8.7.1"], "X-Forwarded-Port": ["3001"], "X-Forwarded-Proto": ["http"]}, "multiValueQueryStringParameters": null, "path": "/users/fewg/calendar", "pathParameters": {"userId": "fewg"}, "queryStringParameters": null, "requestContext": {"accountId": "123456789012", "apiId": "1234567890", "domainName": "127.0.0.1:3001", "extendedRequestId": null, "httpMethod": "GET", "identity": {"accountId": null, "apiKey": null, "caller": null, "cognitoAuthenticationProvider": null, "cognitoAuthenticationType": null, "cognitoIdentityPoolId": null, "sourceIp": "127.0.0.1", "user": null, "userAgent": "Custom User Agent String", "userArn": null}, "path": "/users/{userId}/calendar", "protocol": "HTTP/1.1", "requestId": "6f4b6b4f-c03b-4d62-b9b3-13879ce49bfb", "requestTime": "27/Feb/2025:16:43:56 +0000", "requestTimeEpoch": 1740674636, "resourceId": "123456", "resourcePath": "/users/{userId}/calendar", "stage": "prod"}, "resource": "/users/{userId}/calendar", "stageVariables": null}%


def GET(event, _):
    user_id = event["pathParameters"]["userId"]
    response = table.get_item(Key=user_id)
    if "Item" not in response:
        return 400, {"error": f"Cannot find calendar associated with user id {user_id}"}
    return 200, response["Item"]

def POST(event, _):
    user_id = event["pathParameters"]["userId"]
    return event


methods = [GET,POST]


def lambda_handler(event, context):
    method = event["httpMethod"]
    for method_func in methods:
        if method_func.__name__ == method:
            status_code, body = method_func(event, context)
            return {
                "statusCode": status_code,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(body)
            }
    return {
        "statusCode": 501,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"error": "Http method not supported"})
    }

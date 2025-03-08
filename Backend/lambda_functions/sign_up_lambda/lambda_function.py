import json
#will implement need clarifaction on which user pool
def lambda_handler(event, context):

    return {
        "statusCode": 501,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"error": "Not Implemented"})
    }
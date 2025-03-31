import boto3
import uuid

# Connect to DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
activities_table = dynamodb.Table("activities-table")

# Define your activity configuration
activity_config = {
    "Football": [4, 6, 8, 10],
    "Basketball": [2, 4, 6, 8, 10],
    "Tennis": [2, 4],
    "Pool": [2, 4],
    "Chess": [2],
    "Table Tennis": [2, 4],
    "Darts": [2, 3, 4],
}

difficulties = ["Beginner", "Intermediate", "Advanced"]

# Populate the table
for activity_name, group_sizes in activity_config.items():
    for size in group_sizes:
        for difficulty in difficulties:
            activity_id = str(uuid.uuid4())[:8]  # Shortened unique ID
            item = {
                "activity-id": activity_id,
                "activity_name": activity_name,
                "number_of_people": str(size),
                "ability": difficulty
            }
            activities_table.put_item(Item=item)
            print(f"Added {activity_name} for {size} people [{difficulty}] → ID: {activity_id}")

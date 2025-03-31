from aws_cdk import (
    aws_dynamodb as dynamodb
)


class BathLinkDB:

    def __init__(self):
        self.groupchats_table = None
        self.meetups_table = None
        self.users_table = None

    def create_dbs(self, stack):
        self.users_table = dynamodb.Table(
            stack, "users-table",
            table_name="users-table",
            partition_key=dynamodb.Attribute(
                name="student-id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,  # On-demand pricing
        )

        self.meetups_table = dynamodb.Table(
            stack, "meetups-table",
            table_name="meetups-table",
            partition_key=dynamodb.Attribute(
                name="meetup-id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,  # On-demand pricing
        )

        self.groupchats_table = dynamodb.Table(
            stack, "groupchats-table",
            table_name="groupchats-table",
            partition_key=dynamodb.Attribute(
                name="chat-id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,  # On-demand pricing
        )

        self.activities_table = dynamodb.Table(
            stack, "activities-table",
            table_name="activities-table",
            partition_key=dynamodb.Attribute(
                name="activity-id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,  # On-demand pricing
        )



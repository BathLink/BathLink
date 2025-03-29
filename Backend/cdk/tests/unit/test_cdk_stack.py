import aws_cdk as core
import aws_cdk.assertions as assertions
import os
from pathlib import Path

from Backend.cdk.cdk.cdk_stack import CdkStack


def test_lambdas_created():


    app = core.App()
    stack = CdkStack(app, "CdkStack")
    template = assertions.Template.from_stack(stack)

    lambdas = template.find_resources("AWS::Lambda::Function")

    file_path = Path(__file__).resolve()
    lambdas_path = file_path.parent.parent.parent.parent / "lambda_functions"
    assert len(lambdas) == len(os.listdir(lambdas_path))

    template.has_resource_properties("AWS::Lambda::Function", {
        "Runtime": "python3.9",
    })


def test_cognito_created():
    app = core.App()
    stack = CdkStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    template.has_resource("AWS::Cognito::UserPool",{})

    template.has_resource_properties("AWS::Cognito::UserPool", {
        "UserPoolName": "BathLinkUserPool"
    })

    template.has_resource("AWS::Cognito::UserPoolClient", {})


def test_api_gateway_created():
    app = core.App()
    stack = CdkStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    template.has_resource("AWS::ApiGateway::RestApi",{})


def test_dynamodb_tables_created():
    app = core.App()
    stack = CdkStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    dynamo_tables = template.find_resources("AWS::DynamoDB::Table")

    assert len(dynamo_tables) == 3

    template.has_resource_properties("AWS::DynamoDB::Table", {
        "TableName": "groupchats-table",
        "KeySchema": [
            {"AttributeName": "chat-id", "KeyType": "HASH"}  # Partition Key
        ],
        "AttributeDefinitions": [
            {"AttributeName": "chat-id", "AttributeType": "S"}
        ]
    })

    template.has_resource_properties("AWS::DynamoDB::Table", {
        "TableName": "meetups-table",
        "KeySchema": [
            {"AttributeName": "meetup-id", "KeyType": "HASH"}  # Partition Key
        ],
        "AttributeDefinitions": [
            {"AttributeName": "meetup-id", "AttributeType": "S"}
        ]
    })

    template.has_resource_properties("AWS::DynamoDB::Table", {
        "TableName": "users-table",
        "KeySchema": [
            {"AttributeName": "student-id", "KeyType": "HASH"}  # Partition Key
        ],
        "AttributeDefinitions": [
            {"AttributeName": "student-id", "AttributeType": "S"}
        ]
    })

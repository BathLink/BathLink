import aws_cdk as core
import aws_cdk.assertions as assertions

from Backend.cdk.cdk.cdk_stack import CdkStack


def test_lambdas_created():
    app = core.App()
    stack = CdkStack(app, "CdkStack")
    template = assertions.Template.from_stack(stack)

    lambdas = template.find_resources("AWS::Lambda::Function")
    print(lambdas)
    assert len(lambdas) == 1


def test_cognito_created():
    app = core.App()
    stack = CdkStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    template.has_resource("AWS::Cognito::UserPool")

def test_api_gateway_created():
    app = core.App()
    stack = CdkStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    template.has_resource("AWS::Apigateway")
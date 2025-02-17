from aws_cdk import (
    # Duration,
    Stack, CfnOutput,
    aws_apigateway,
    aws_lambda as _lambda,
    aws_cognito as cognito
)
from pathlib import Path
from constructs import Construct


class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        lambdas = self.create_lambdas()

        # API Gateway
        api = self.create_api(lambdas)

        user_pool,app_client = self.configure_cognito()

        CfnOutput(self, "APIEndpoint", value=api.url)
        CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id)

    def create_lambdas(self):
        lambdas = {}
        lambda_path = str(Path(__file__).resolve().parent.parent.parent / "lambda_functions" / "example_lambda")
        lambdas['example_lambda'] = _lambda.Function(
            self, "Example Lambda",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="lambda_function.lambda_handler",
            code=_lambda.Code.from_asset(lambda_path),
        )
        return lambdas

    def create_api(self, lambdas):
        api = aws_apigateway.LambdaRestApi(self, "MyApi", handler=lambdas['example_lambda'])

        return api

    def configure_cognito(self):
        user_pool = cognito.UserPool(
            self, "BathLinkUserPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(phone=True),
            auto_verify=cognito.AutoVerifiedAttrs(phone=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
                require_symbols=True
            ),
            standard_attributes = cognito.StandardAttributes(
                phone_number=cognito.StandardAttribute(required=True),
                given_name=cognito.StandardAttribute(required=True),
                family_name=cognito.StandardAttribute(required=True),
                birthdate=cognito.StandardAttribute(required=True),
            )
        )

        app_client = user_pool.add_client(
            "BathLinkAppClient",
            generate_secret=True,
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True
            )
        )

        return user_pool, app_client



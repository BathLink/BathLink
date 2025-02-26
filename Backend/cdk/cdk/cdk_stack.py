from aws_cdk import (
    Stack, CfnOutput,
    aws_cognito as cognito
)
from constructs import Construct
from .bathlink_lambdas import BathLinkLambdas
from .bathlink_api import BathLinkAPI




class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        lambdas = BathLinkLambdas().create_lambdas(self)

        user_pool,app_client = self.configure_cognito()

        api = BathLinkAPI().create_api(self, user_pool, lambdas)

        CfnOutput(self, "APIEndpoint", value=api.url)
        CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id)
        CfnOutput(self,"AppClientId",value=app_client.user_pool_client_id)




    def configure_cognito(self):
        user_pool = cognito.UserPool(
            self, "BathLinkUserPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
            ),
            standard_attributes = cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True),
                phone_number=cognito.StandardAttribute(required=True),
                given_name=cognito.StandardAttribute(required=True),
                family_name=cognito.StandardAttribute(required=True),
                birthdate=cognito.StandardAttribute(required=True),
            )
        )

        app_client = user_pool.add_client(
            "BathLinkAppClient",
            generate_secret=False,
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True
            )
        )

        return user_pool, app_client



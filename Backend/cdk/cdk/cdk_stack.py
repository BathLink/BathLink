from aws_cdk import (
    Stack, CfnOutput,
    aws_cognito as _cognito
)
from constructs import Construct

from .bathlink_cognito import BathLinkCognito
from .bathlink_databases import BathLinkDB
from .bathlink_lambdas import BathLinkLambdas
from .bathlink_api import BathLinkAPI




class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        tables = BathLinkDB()
        tables.create_dbs(self)

        cognito = BathLinkCognito()
        cognito.create_cognito(self)

        lambdas = BathLinkLambdas()
        lambdas.create_lambdas(self, tables, cognito)

        cognito.user_pool.add_trigger(
            _cognito.UserPoolOperation.POST_CONFIRMATION,
            lambdas.manage_users
        )

        api = BathLinkAPI().create_api(self, cognito.user_pool, lambdas)

        CfnOutput(self, "APIEndpoint", value=api.url)
        CfnOutput(self, "UserPoolId", value=cognito.user_pool.user_pool_id)
        CfnOutput(self,"AppClientId",value=cognito.app_client.user_pool_client_id)








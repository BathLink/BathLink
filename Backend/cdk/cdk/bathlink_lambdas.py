from pathlib import Path
from aws_cdk import (
    aws_lambda as _lambda,
)

class BathLinkLambdas:

    def create_lambdas(self,stack):
        def create_lambda(name):
            lambda_path = str(Path(__file__).resolve().parent.parent.parent / "lambda_functions" / name)
            lambdas[name] = _lambda.Function(
                stack, name,
                runtime=_lambda.Runtime.PYTHON_3_9,
                handler="lambda_function.lambda_handler",
                code=_lambda.Code.from_asset(lambda_path),
                function_name=name,
            )

        lambdas = {}
        create_lambda('manage_meetups_lambda')
        create_lambda('search_meetups_lambda')
        create_lambda('manage_users_lambda')
        create_lambda('manage_profiles_lambda')
        create_lambda('sign_up_lambda')
        create_lambda('manage_chats_lambda')
        create_lambda('manage_calendars_lambda')


        return lambdas
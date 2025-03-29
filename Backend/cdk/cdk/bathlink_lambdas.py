from pathlib import Path
from aws_cdk import (
    aws_lambda as _lambda,
    aws_iam as iam,
    aws_events as events,
    aws_events_targets as targets,
)

from .bathlink_cognito import BathLinkCognito
from .bathlink_databases import BathLinkDB


class BathLinkLambdas:

    def __init__(self):
        self.search_meetups = None
        self.manage_meetups = None
        self.manage_users = None
        self.manage_profiles = None
        self.sign_up = None
        self.manage_chats = None
        self.manage_calendars = None
        self.manage_activities = None
        self.lambdas = {}

    def __getitem__(self, item):
        return self.lambdas[item]

    def create_lambdas(self,stack,tables:BathLinkDB,cognito:BathLinkCognito):
        def create_lambda(name, tables_to_access=None):
            lambda_path = str(Path(__file__).resolve().parent.parent.parent / "lambda_functions" / name)
            lambda_function = _lambda.Function(
                stack, name,
                runtime=_lambda.Runtime.PYTHON_3_9,
                handler="lambda_function.lambda_handler",
                code=_lambda.Code.from_asset(lambda_path),
                function_name=name,
            )

            if tables_to_access:
                for table in tables_to_access:
                    table.grant_read_write_data(lambda_function)

            self.lambdas[name] = lambda_function
            return lambda_function

        self.manage_meetups = create_lambda('manage_meetups_lambda',[tables.meetups_table])

        self.search_meetups = create_lambda('search_meetups_lambda',[tables.meetups_table,tables.users_table])
        rule = events.Rule(
            stack, 'DailyTrigger',
            schedule=events.Schedule.cron(hour="0", minute="0")  # Runs at midnight UTC
        )

        rule.add_target(targets.LambdaFunction(self.search_meetups))

        self.manage_users = create_lambda('manage_users_lambda',[tables.users_table,tables.meetups_table])
        self.manage_users.add_permission(
            "CognitoTriggerPermission",
            principal=iam.ServicePrincipal("cognito-idp.amazonaws.com"),
            action="lambda:InvokeFunction",
            source_arn=cognito.user_pool.user_pool_arn
        )
        self.manage_profiles = create_lambda('manage_profiles_lambda',[tables.users_table])
        self.manage_chats = create_lambda('manage_chats_lambda',[tables.groupchats_table])
        self.manage_calendars = create_lambda('manage_calendars_lambda',[tables.users_table])
        self.manage_activities = create_lambda('manage_activities_lambda',[tables.users_table])

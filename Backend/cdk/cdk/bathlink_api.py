from aws_cdk import (
    aws_apigateway as apigateway,
)

from .bathlink_lambdas import BathLinkLambdas



class BathLinkAPI:

    def create_api(self, stack, user_pool,user_pool2, lambdas):
        def add_method(
            root,
            method,
            lambda_handler,
            name="",
            method_responses=None,
            request_parameters=None,
            authorization=True,
        ):
            root.add_method(
                method,
                apigateway.LambdaIntegration(lambdas[lambda_handler]),
                authorization_type=(
                    apigateway.AuthorizationType.COGNITO
                    if authorization
                    else apigateway.AuthorizationType.NONE
                ),
                authorizer=authorizer if authorization else None,
                operation_name=name,
                method_responses=method_responses,
                request_parameters=request_parameters,
            )

        authorizer = apigateway.CognitoUserPoolsAuthorizer(
            stack, "BathLinkAuthorizer", cognito_user_pools=[user_pool,user_pool2]
        )

        api = apigateway.RestApi(
            stack,
            "BathLinkApi",
            rest_api_name="BathLinkApi",
            default_cors_preflight_options={
                "allow_origins": apigateway.Cors.ALL_ORIGINS,
                "allow_methods": apigateway.Cors.ALL_METHODS,
            },
        )

        meetups = api.root.add_resource("meetups")
        meetup = meetups.add_resource("{meetupId}")

        search_meetups = api.root.add_resource("search-meetups")
        add_method(
            search_meetups, "POST", "search_meetups_lambda"
        )

        users = api.root.add_resource(
            "users",
        )
        user = users.add_resource("{userId}")
        profile = user.add_resource("profile")
        calendar = user.add_resource("calendar")
        preferences = user.add_resource("preferences")
        user_meetups = user.add_resource("meetups")

        add_method(user_meetups, "GET", "manage_users_lambda")  # Get user meetups

        add_method(
            calendar,
            "GET",
            "manage_calendars_lambda",
            "GetUserCalendar",
        )
        add_method(
            calendar,
            "POST",
            "manage_calendars_lambda",
            "PostCalendarData",
        )  # Post calendar data
        add_method(
            calendar,
            "DELETE",
            "manage_calendars_lambda",
            "Delete Calendar",

        )

        add_method(preferences, "GET", "manage_preferences_lambda")
        add_method(preferences,"PUT","manage_preferences_lambda")

        chats = api.root.add_resource("chats")
        chat = chats.add_resource("{chatId}")

        add_method(meetup, "GET", "manage_meetups_lambda")  # Get meetup info
        add_method(meetup, "POST", "manage_meetups_lambda")  # Create meetup
        add_method(meetup, "DELETE", "manage_meetups_lambda")  # Delete/Cancel meetup
        add_method(meetup, "PUT", "manage_meetups_lambda")  # Update meetup

        add_method(user, "GET", "manage_users_lambda")  # Get user info
        add_method(user, "DELETE", "manage_users_lambda")  # Delete user
        add_method(user, "PUT", "manage_users_lambda")  # Update user



        add_method(chat, "GET", "manage_chats_lambda")  # Get messages
        add_method(chat, "POST", "manage_chats_lambda")  # Send messages
        add_method(chat, "DELETE", "manage_chats_lambda")  # Delete chat

        add_method(profile, "GET", "manage_profiles_lambda")  # Get Profile
        add_method(profile, "POST", "manage_profiles_lambda")  # Add Profile
        add_method(profile, "PUT", "manage_profiles_lambda")  # Update Profile
        

        activities = api.root.add_resource("activities")
        add_method(activities, "GET", "manage_activities_lambda")  # Get activities
        activity = activities.add_resource("{activityId}")
        add_method(activity, "GET", "manage_activities_lambda")

        return api

from aws_cdk import (
    aws_apigateway as apigateway,
)


class BathLinkAPI:

    def create_api(self, stack, user_pool, lambdas):
        def add_method(root, method, lambda_handler, name="", method_responses=None,request_parameters = None, authorization=True):
            root.add_method(
                method,
                apigateway.LambdaIntegration(lambdas[lambda_handler]),
                authorization_type=apigateway.AuthorizationType.COGNITO if authorization else apigateway.AuthorizationType.NONE,
                authorizer=authorizer if authorization else None,
                operation_name=name,
                method_responses=method_responses,
                request_parameters=request_parameters
            )

        authorizer = apigateway.CognitoUserPoolsAuthorizer(
            stack, "BathLinkAuthorizer",
            cognito_user_pools=[user_pool]
        )

        api = apigateway.RestApi(
            stack,
            "BathLinkApi",
            rest_api_name="BathLinkApi",
            default_cors_preflight_options={
                "allow_origins": apigateway.Cors.ALL_ORIGINS,
                "allow_methods": apigateway.Cors.ALL_METHODS
            },

        )

        meetups = api.root.add_resource("meetups")
        meetup = meetups.add_resource("{meetupId}")

        add_method(meetup, "GET", 'manage_meetups_lambda')  # Get meetup info
        add_method(meetup, "POST", 'manage_meetups_lambda')  # Create meetup
        add_method(meetup, "DELETE", 'manage_meetups_lambda')  # Delete/Cancel meetup
        add_method(meetup, "PUT", 'manage_meetups_lambda')  # Update meetup

        search_meetups = meetups.add_resource("search")
        add_method(search_meetups, "POST", 'search_meetups_lambda')  # Search for new potential meetup

        users = api.root.add_resource("users", )
        user = users.add_resource("{userId}")
        profile = user.add_resource("profile")
        calendar = user.add_resource("calendar")

        add_method(user, "GET", 'manage_users_lambda')  # Get user info
        add_method(user, "DELETE", 'manage_users_lambda')  # Delete user
        add_method(user, "PUT", 'manage_users_lambda')  # Update user

        add_method(profile, "GET", 'manage_profiles_lambda')  # Get Profile
        add_method(profile, "POST", 'manage_profiles_lambda')  # Add Profile
        add_method(profile, "PUT", 'manage_profiles_lambda')  # Update Profile

        add_method(calendar, "GET", 'manage_calendars_lambda', "GetUserCalendar", [

            {
                'statusCode': '200',
                'description': 'User calendar returned',
            },
            {
                'statusCode': '404',
                'description': 'User not Found',
            }

        ])
        add_method(calendar, "POST", 'manage_calendars_lambda', "PostCalendarData", [
            {
                'statusCode':'200',
                'description':'Calendar Updated'
            },
            {
                'statusCode': '404',
                'description': 'User not Found'
            },
            {
                'statusCode': '400',
                'description': 'No Post Data Provided'
            },
        ],{
            "method.request.querystring.calendarData": True
        })  # Post calendar data
        add_method(calendar, "DELETE", 'manage_calendars_lambda',"Delete Calendar",[
            {
                'statusCode': '200',
                'description': 'User calendar returned',
            },
            {
                'statusCode': '404',
                'description': 'Calendar not Found',
            }
        ])

        add_method(calendar,"GET",'manage_calendars_lambda') #Get calendar info
        add_method(calendar,"POST",'manage_calendars_lambda') #Post calendar data
        add_method(calendar, "DELETE", 'manage_calendars_lambda') #Delete calendar info

        sign_up = api.root.add_resource("sign_up")
        add_method(sign_up, "POST", 'sign_up_lambda', authorization=False)  # Signup user

        chats = api.root.add_resource("chats")
        chat = chats.add_resource("{chatId}")

        add_method(chat, "GET", 'manage_chats_lambda')  # Get messages
        add_method(chat, "POST", 'manage_chats_lambda')  # Send messages
        add_method(chat, "DELETE", 'manage_chats_lambda')  # Delete chat

        return api

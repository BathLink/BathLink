from aws_cdk import aws_cognito as cognito


class BathLinkCognito:

    def __init__(self):
        self.app_client = None
        self.user_pool = None

    def create_cognito(self, stack):
        self.user_pool = cognito.UserPool(
            stack, "BathLinkUserPool",user_pool_name="BathLinkUserPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
            ),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True),
                phone_number=cognito.StandardAttribute(required=True),
                given_name=cognito.StandardAttribute(required=True),
                family_name=cognito.StandardAttribute(required=True),
                birthdate=cognito.StandardAttribute(required=True),
            )
        )

        self.app_client = self.user_pool.add_client(
            "BathLinkAppClient",
            generate_secret=False,
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True
            )
        )







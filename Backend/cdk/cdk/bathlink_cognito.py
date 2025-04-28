from aws_cdk import aws_cognito as cognito
from aws_cdk import aws_iam as iam


class BathLinkCognito:

    def __init__(self):
        self.identity_pool2 = None
        self.app_client2 = None
        self.user_pool2 = None
        self.identity_pool = None
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

        self.identity_pool = cognito.CfnIdentityPool(
            stack, "BathLinkIdentityPool",
            allow_unauthenticated_identities=False,
            cognito_identity_providers=[{
                "clientId": self.app_client.user_pool_client_id,
                "providerName": self.user_pool.user_pool_provider_name,
            }],
            identity_pool_name="BathLinkIdentityPool"
        )

        auth_role = iam.Role(
            stack, "CognitoAuthRole",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    "StringEquals": {"cognito-identity.amazonaws.com:aud": self.identity_pool.ref},
                    "ForAnyValue:StringLike": {"cognito-identity.amazonaws.com:amr": "authenticated"}
                },
                "sts:AssumeRoleWithWebIdentity"
            )
        )

        auth_role.add_to_policy(iam.PolicyStatement(
            actions=["s3:GetObject", "s3:PutObject"],
            resources=["arn:aws:s3:::bathlink-pfp/*"]
        ))

        cognito.CfnIdentityPoolRoleAttachment(
            stack, "IdentityPoolRoleAttachment",
            identity_pool_id=self.identity_pool.ref,
            roles={"authenticated": auth_role.role_arn}
        )

        self.user_pool2 = cognito.UserPool(
            stack, "BathLinkUserPool2", user_pool_name="BathLinkUserPool2",
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

        self.app_client2 = self.user_pool2.add_client(
            "BathLinkAppClient2",
            generate_secret=False,
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True
            )
        )

        self.identity_pool2 = cognito.CfnIdentityPool(
            stack, "BathLinkIdentityPool2",
            allow_unauthenticated_identities=False,
            cognito_identity_providers=[{
                "clientId": self.app_client2.user_pool_client_id,
                "providerName": self.user_pool2.user_pool_provider_name,
            }],
            identity_pool_name="BathLinkIdentityPool2"
        )

        auth_role2 = iam.Role(
            stack, "CognitoAuthRole2",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    "StringEquals": {"cognito-identity.amazonaws.com:aud": self.identity_pool2.ref},
                    "ForAnyValue:StringLike": {"cognito-identity.amazonaws.com:amr": "authenticated"}
                },
                "sts:AssumeRoleWithWebIdentity"
            )
        )

        auth_role2.add_to_policy(iam.PolicyStatement(
            actions=["s3:GetObject", "s3:PutObject"],
            resources=["arn:aws:s3:::bathlink-pfp/*"]
        ))

        cognito.CfnIdentityPoolRoleAttachment(
            stack, "IdentityPoolRoleAttachment2",
            identity_pool_id=self.identity_pool2.ref,
            roles={"authenticated": auth_role2.role_arn}
        )






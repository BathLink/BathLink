#!/usr/bin/env python3

import aws_cdk as cdk

from cdk.cdk_stack import CdkStack

app = cdk.App()
CdkStack(app, "CdkStack",
         env=cdk.Environment(account='376129876633', region='eu-west-2'),
         )

app.synth()

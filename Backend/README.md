## BathLink Backend

This is the backend for the Bathlink API. It comprises of an API with a database hosted with AWS.

### Installation
Install AWS CDK:
```
$ npm install aws-cdk
```
Install AWS CLI:
```
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
```

Install AWS SAM CLI:
```
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions
```

Manually create a virtualenv on MacOS and Linux:

```
$ python3 -m venv .venv
```

Active Virtual Env MacOS and Linux:

```
$ source .venv/bin/activate
```

Activate Virtual Env Windows:

```
% .venv\Scripts\activate.bat
```

Install requirements:

```
$ python -m pip install -r requirements.txt
```
Boostrap AWS CDK:
```
$ cdk bootstrap
```

### Usage
Deploy changes to AWS
```
cdk deploy
```

Run tests
```
pytest
```
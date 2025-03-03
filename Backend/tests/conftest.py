import pytest
import os

# moto needs you to have credentials set for some reason
@pytest.fixture(scope="session", autouse=True)
def set_fake_aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "fake"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "fake"

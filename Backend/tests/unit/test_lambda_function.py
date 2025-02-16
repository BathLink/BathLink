from Backend.lambda_functions.example_lambda.lambda_function import lambda_handler


def test_lambda_handler():
    result = lambda_handler({}, {})
    assert result["statusCode"] == 200
    assert result["body"]["message"] == "This is a Test"

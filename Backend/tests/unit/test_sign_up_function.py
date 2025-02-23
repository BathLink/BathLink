import requests
import pytest

@pytest.mark.benchmark(group='Sign up')
def test_example_1(benchmark):
    benchmark(lambda: True)
    assert True

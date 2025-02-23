import requests
import pytest

@pytest.mark.benchmark(group='Manage Meetups')
def test_example_1(benchmark):
    benchmark(lambda: True)
    assert True

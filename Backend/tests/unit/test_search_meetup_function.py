import pytest

@pytest.mark.benchmark(group='Search Meetup')
def test_example_1(benchmark):
    benchmark(lambda: True)
    assert True

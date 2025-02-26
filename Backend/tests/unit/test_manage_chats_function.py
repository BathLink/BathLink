import pytest

@pytest.mark.benchmark(group='Manage Chats')
def test_example_1(benchmark):
    benchmark(lambda: True)
    assert True

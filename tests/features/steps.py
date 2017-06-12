from lettuce import step, world
from nose.tools import assert_equal, assert_true


@step('Given I navigate to the Heady Locator Home page')
def step_impl(step):
    world.home_page.navigate("http://d32opuj8xomlt4.cloudfront.net/")
    assert_equal(world.home_page.get_page_title(), "Geocoding service")


@step('Then I see a see the map "([^"]*)"')
def step_impl(step, search_result):
    assert_true(world.home_page.find_search_result(search_result))

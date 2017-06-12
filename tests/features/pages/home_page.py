from selenium.webdriver.common.by import By

class HomePageLocator(object):
    # Home Page Locators

    MAP = (By.ID, "map")


class HomePage(object):
    # Home Page Actions

    def __init__(self, browser):
        self.driver = browser

    def fill(self, text, *locator):
        self.driver.find_element(*locator).send_keys(text)

    def click_element(self, *locator):
        self.driver.find_element(*locator).click()

    def navigate(self, address):
        self.driver.get(address)

    def get_page_title(self):
        return self.driver.title

    def get_element(self, *locator):
        return self.driver.find_element(*locator)

    def find_search_result(self, search_result):
        return self.get_element(By.ID, search_result)




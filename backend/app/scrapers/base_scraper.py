from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class FlightResult:
    def __init__(self, airline: str, departure_date: datetime, cabin_class: str, miles_cost: int, available_seats: int):
        self.airline = airline
        self.departure_date = departure_date
        self.cabin_class = cabin_class
        self.miles_cost = miles_cost
        self.available_seats = available_seats


class BaseScraper(ABC):
    def __init__(self, airline_name: str):
        self.airline_name = airline_name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    @abstractmethod
    def search_flights(self, departure_airport: str, arrival_airport: str, start_date: datetime, end_date: datetime, cabin_class: str) -> List[FlightResult]:
        """Search for award flights and return results"""
        pass

    def get_selenium_driver(self) -> webdriver.Chrome:
        """Get a configured Selenium WebDriver for sites requiring JavaScript"""
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

        driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
        return driver

    def parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object. Override in subclasses for specific formats."""
        # Default implementation - subclasses should override
        return datetime.strptime(date_str, '%Y-%m-%d')

    def clean_miles_cost(self, cost_str: str) -> int:
        """Clean and parse miles cost from string"""
        # Remove commas, spaces, and extract numbers
        import re
        match = re.search(r'\d+', cost_str.replace(',', '').replace(' ', ''))
        return int(match.group()) if match else 0
from typing import List
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from .base_scraper import FlightResult
from .british_airways import BritishAirwaysScraper
from .flying_blue import FlyingBlueScraper


class ScraperManager:
    def __init__(self):
        self.scrapers = [
            BritishAirwaysScraper(),
            FlyingBlueScraper(),
            # Add more scrapers here as implemented
        ]

    def search_all_airlines(self, departure_airport: str, arrival_airport: str, start_date: datetime, end_date: datetime, cabin_classes: List[str]) -> List[FlightResult]:
        """Search across all configured airlines concurrently"""
        all_results = []

        # For each cabin class, search all airlines
        for cabin_class in cabin_classes:
            with ThreadPoolExecutor(max_workers=len(self.scrapers)) as executor:
                # Submit search tasks for each scraper
                future_to_scraper = {
                    executor.submit(scraper.search_flights, departure_airport, arrival_airport, start_date, end_date, cabin_class): scraper
                    for scraper in self.scrapers
                }

                # Collect results as they complete
                for future in as_completed(future_to_scraper):
                    scraper = future_to_scraper[future]
                    try:
                        results = future.result()
                        all_results.extend(results)
                    except Exception as exc:
                        print(f'{scraper.airline_name} scraper generated an exception: {exc}')

        return all_results

    def add_scraper(self, scraper):
        """Add a new scraper to the manager"""
        self.scrapers.append(scraper)

    def get_available_airlines(self) -> List[str]:
        """Get list of airlines that have scrapers"""
        return [scraper.airline_name for scraper in self.scrapers]
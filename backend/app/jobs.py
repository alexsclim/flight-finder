import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal
from .services import (
    get_active_alerts_for_checking,
    mark_alert_checked,
    get_user_notification_settings,
    add_alert_match,
    match_exists,
    create_search_session,
)
from .schemas import SearchRequest


def send_alert_notification(phone_number: str, message: str) -> bool:
    # Placeholder for real SMS integration.
    print(f'Notification placeholder: sending SMS to {phone_number}: {message}')
    return True


def build_notification_message(departure_airport: str, arrival_airport: str, airline: str, cabin_class: str, departure_date: str, miles_cost: int) -> str:
    return f'✈️ Award found! {departure_airport}→{arrival_airport} on {departure_date} {cabin_class} • {miles_cost} miles • {airline}'


def process_alert(db: Session, alert):
    settings = get_user_notification_settings(db, alert.user_id)
    if not settings or not settings.get('notifications_enabled') or not settings.get('phone_number'):
        return

    search_payload = SearchRequest(
        departureAirport=alert.departure_airport,
        arrivalAirport=alert.arrival_airport,
        startDate=alert.start_date,
        endDate=alert.end_date,
        cabinClasses=alert.cabin_classes,
        airlines=alert.airlines,
        maxMilesCost=alert.max_miles_cost,
    )

    search_session, results = create_search_session(db, alert.user_id, search_payload)
    for result in results:
        if match_exists(db, alert.id, result.airline, result.departure_date, result.cabin_class, result.miles_cost):
            continue

        add_alert_match(
            db,
            alert.id,
            alert.user_id,
            result.airline,
            result.departure_date,
            result.cabin_class,
            result.miles_cost,
        )

        message = build_notification_message(
            alert.departure_airport,
            alert.arrival_airport,
            result.airline,
            result.cabin_class,
            result.departure_date.date().isoformat(),
            result.miles_cost,
        )
        send_alert_notification(settings['phone_number'], message)


def check_and_match_alerts():
    db = SessionLocal()
    try:
        alerts = get_active_alerts_for_checking(db)
        for alert in alerts:
            try:
                process_alert(db, alert)
                mark_alert_checked(db, alert.id)
            except Exception as exc:
                print('Error processing alert', alert.id, exc)
    finally:
        db.close()


async def start_alert_matcher():
    await asyncio.to_thread(check_and_match_alerts)
    while True:
        await asyncio.sleep(60 * 60)
        await asyncio.to_thread(check_and_match_alerts)

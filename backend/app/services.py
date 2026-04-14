from datetime import datetime, timedelta
from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from . import models, schemas


def random_result_id() -> str:
    return str(uuid.uuid4())


def normalize_date(value: datetime) -> datetime:
    return datetime.fromisoformat(value.isoformat()) if isinstance(value, datetime) else value


def create_search_session(db: Session, user_id: Optional[str], payload: schemas.SearchRequest):
    session = models.SearchSession(
        user_id=user_id,
        departure_airport=payload.departureAirport,
        arrival_airport=payload.arrivalAirport,
        start_date=payload.startDate,
        end_date=payload.endDate,
        cabin_classes=payload.cabinClasses,
        airlines=payload.airlines,
        max_miles_cost=payload.maxMilesCost,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    results = []
    current_date = payload.startDate
    max_days = min((payload.endDate - payload.startDate).days + 1, 3)

    for day_offset in range(max_days):
        if current_date > payload.endDate:
            break

        for airline in payload.airlines:
            for cabin in payload.cabinClasses:
                miles_cost = 10000 + day_offset * 500 + len(cabin) * 400 + (sum(ord(c) for c in airline) % 1000)
                if payload.maxMilesCost and miles_cost > payload.maxMilesCost:
                    continue
                result = models.AvailabilityResult(
                    search_session_id=session.id,
                    airline=airline,
                    departure_date=current_date,
                    departure_time='08:00',
                    arrival_time='12:00',
                    cabin_class=cabin,
                    miles_cost=miles_cost,
                    available_seats=1,
                    external_id=random_result_id(),
                )
                db.add(result)
                results.append(result)

        current_date += timedelta(days=1)

    db.commit()
    for result in results:
        db.refresh(result)

    return session, results


def get_search_results(db: Session, search_session_id: str):
    session = db.query(models.SearchSession).filter(models.SearchSession.id == search_session_id).first()
    if not session:
        return None
    results = (
        db.query(models.AvailabilityResult)
        .filter(models.AvailabilityResult.search_session_id == session.id)
        .order_by(models.AvailabilityResult.departure_date.asc(), models.AvailabilityResult.miles_cost.asc())
        .all()
    )
    return {'session': session, 'results': results}


def get_user_search_history(db: Session, user_id: str, limit: int = 10):
    sessions = (
        db.query(models.SearchSession)
        .filter(models.SearchSession.user_id == user_id)
        .order_by(models.SearchSession.created_at.desc())
        .limit(limit)
        .all()
    )
    return sessions


def create_alert(db: Session, user_id: str, payload: schemas.AlertCreateRequest):
    alert = models.Alert(
        user_id=user_id,
        departure_airport=payload.departureAirport,
        arrival_airport=payload.arrivalAirport,
        start_date=payload.startDate,
        end_date=payload.endDate,
        cabin_classes=payload.cabinClasses,
        airlines=payload.airlines,
        max_miles_cost=payload.maxMilesCost,
        active=True,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_user_alerts(db: Session, user_id: str):
    return (
        db.query(models.Alert)
        .filter(models.Alert.user_id == user_id, models.Alert.active == True)
        .order_by(models.Alert.created_at.desc())
        .all()
    )


def get_alert_with_matches(db: Session, alert_id: str):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        _ = alert.matches
    return alert


def update_alert(db: Session, alert_id: str, payload: schemas.AlertUpdateRequest):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        return None

    if payload.startDate is not None:
        alert.start_date = payload.startDate
    if payload.endDate is not None:
        alert.end_date = payload.endDate
    if payload.cabinClasses is not None:
        alert.cabin_classes = payload.cabinClasses
    if payload.airlines is not None:
        alert.airlines = payload.airlines
    if payload.maxMilesCost is not None:
        alert.max_miles_cost = payload.maxMilesCost
    if payload.active is not None:
        alert.active = payload.active

    alert.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert


def delete_alert(db: Session, alert_id: str):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return alert


def get_active_alerts_for_checking(db: Session):
    threshold = datetime.utcnow() - timedelta(hours=2)
    return (
        db.query(models.Alert)
        .filter(models.Alert.active == True)
        .filter(
            (models.Alert.last_checked == None) | (models.Alert.last_checked < threshold)
        )
        .all()
    )


def mark_alert_checked(db: Session, alert_id: str):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        return None
    alert.last_checked = datetime.utcnow()
    db.commit()
    return alert


def add_alert_match(
    db: Session,
    alert_id: str,
    user_id: str,
    airline: str,
    departure_date: datetime,
    cabin_class: str,
    miles_cost: int,
):
    match = models.AlertMatch(
        alert_id=alert_id,
        user_id=user_id,
        airline=airline,
        departure_date=departure_date,
        cabin_class=cabin_class,
        miles_cost=miles_cost,
        available_seat=True,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def match_exists(
    db: Session,
    alert_id: str,
    airline: str,
    departure_date: datetime,
    cabin_class: str,
    miles_cost: int,
) -> bool:
    day_start = departure_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = departure_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    existing = (
        db.query(models.AlertMatch)
        .filter(models.AlertMatch.alert_id == alert_id)
        .filter(models.AlertMatch.airline == airline)
        .filter(models.AlertMatch.cabin_class == cabin_class)
        .filter(models.AlertMatch.miles_cost == miles_cost)
        .filter(models.AlertMatch.departure_date >= day_start)
        .filter(models.AlertMatch.departure_date <= day_end)
        .first()
    )
    return existing is not None


def get_user_notification_settings(db: Session, user_id: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    return {
        'phone_number': user.phone_number,
        'notifications_enabled': user.notifications_enabled,
        'alert_cooldown_minutes': user.alert_cooldown_minutes,
    }


def is_user_authorized_for_alert(db: Session, alert_id: str, user_id: str) -> bool:
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    return alert is not None and alert.user_id == user_id

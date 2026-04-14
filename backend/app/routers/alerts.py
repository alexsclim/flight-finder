from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import get_db
from ..schemas import AlertCreateRequest, AlertUpdateRequest, AlertResponse
from ..services import (
    create_alert,
    get_user_alerts,
    get_alert_with_matches,
    update_alert,
    delete_alert,
)

router = APIRouter()


def alert_to_response(alert):
    return {
        'id': alert.id,
        'userId': alert.user_id,
        'departureAirport': alert.departure_airport,
        'arrivalAirport': alert.arrival_airport,
        'startDate': alert.start_date,
        'endDate': alert.end_date,
        'cabinClasses': alert.cabin_classes,
        'airlines': alert.airlines,
        'maxMilesCost': alert.max_miles_cost,
        'active': alert.active,
        'createdAt': alert.created_at,
        'updatedAt': alert.updated_at,
        'lastChecked': alert.last_checked,
        'matches': [
            {
                'id': match.id,
                'airline': match.airline,
                'departureDate': match.departure_date,
                'cabinClass': match.cabin_class,
                'milesCost': match.miles_cost,
                'availableSeat': match.available_seat,
                'notificationSent': match.notification_sent,
                'notificationTime': match.notification_time,
                'createdAt': match.created_at,
            }
            for match in getattr(alert, 'matches', [])
        ],
    }


@router.post('/', response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_new_alert(
    payload: AlertCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail='startDate must be before endDate')

    alert = create_alert(db, current_user.id, payload)
    return alert_to_response(alert)


@router.get('/', response_model=list[AlertResponse])
def list_alerts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    alerts = get_user_alerts(db, current_user.id)
    return [alert_to_response(alert) for alert in alerts]


@router.get('/{alert_id}', response_model=AlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    alert = get_alert_with_matches(db, alert_id)
    if alert is None or alert.user_id != current_user.id:
        raise HTTPException(status_code=404, detail='Alert not found')
    return alert_to_response(alert)


@router.patch('/{alert_id}', response_model=AlertResponse)
def patch_alert(
    alert_id: str,
    payload: AlertUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    alert = get_alert_with_matches(db, alert_id)
    if alert is None or alert.user_id != current_user.id:
        raise HTTPException(status_code=404, detail='Alert not found')

    updated = update_alert(db, alert_id, payload)
    if updated is None:
        raise HTTPException(status_code=404, detail='Alert not found')
    return alert_to_response(updated)


@router.delete('/{alert_id}')
def remove_alert(alert_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    alert = get_alert_with_matches(db, alert_id)
    if alert is None or alert.user_id != current_user.id:
        raise HTTPException(status_code=404, detail='Alert not found')

    delete_alert(db, alert_id)
    return {'success': True}

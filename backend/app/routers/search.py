from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..auth import get_current_user_optional
from ..database import get_db
from ..schemas import SearchRequest, SearchSessionResponse, SearchHistoryItem
from ..services import create_search_session, get_search_results, get_user_search_history

router = APIRouter()


@router.post('/', response_model=SearchSessionResponse)
def perform_search(
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail='startDate must be before endDate')

    user_id = current_user.id if current_user else None
    session, results = create_search_session(db, user_id, payload)

    return {
        'session': {
            'id': session.id,
            'departureAirport': session.departure_airport,
            'arrivalAirport': session.arrival_airport,
            'startDate': session.start_date,
            'endDate': session.end_date,
            'cabinClasses': session.cabin_classes,
            'airlines': session.airlines,
            'maxMilesCost': session.max_miles_cost,
            'createdAt': session.created_at,
            'expiresAt': session.expires_at,
        },
        'results': [
            {
                'id': result.id,
                'airline': result.airline,
                'departureDate': result.departure_date,
                'departureTime': result.departure_time,
                'arrivalTime': result.arrival_time,
                'cabinClass': result.cabin_class,
                'milesCost': result.miles_cost,
                'availableSeats': result.available_seats,
                'externalId': result.external_id,
            }
            for result in results
        ],
    }


@router.get('/history/user', response_model=list[SearchHistoryItem])
def user_search_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sessions = get_user_search_history(db, current_user.id)
    return [
        {
            'id': session.id,
            'departureAirport': session.departure_airport,
            'arrivalAirport': session.arrival_airport,
            'startDate': session.start_date,
            'endDate': session.end_date,
            'cabinClasses': session.cabin_classes,
            'airlines': session.airlines,
            'createdAt': session.created_at,
            'resultsCount': len(session.results),
        }
        for session in sessions
    ]


@router.get('/{search_session_id}', response_model=SearchSessionResponse)
def get_session_result(search_session_id: str, db: Session = Depends(get_db)):
    result = get_search_results(db, search_session_id)
    if result is None:
        raise HTTPException(status_code=404, detail='Search session not found')
    return {
        'session': {
            'id': result['session'].id,
            'departureAirport': result['session'].departure_airport,
            'arrivalAirport': result['session'].arrival_airport,
            'startDate': result['session'].start_date,
            'endDate': result['session'].end_date,
            'cabinClasses': result['session'].cabin_classes,
            'airlines': result['session'].airlines,
            'maxMilesCost': result['session'].max_miles_cost,
            'createdAt': result['session'].created_at,
            'expiresAt': result['session'].expires_at,
        },
        'results': [
            {
                'id': row.id,
                'airline': row.airline,
                'departureDate': row.departure_date,
                'departureTime': row.departure_time,
                'arrivalTime': row.arrival_time,
                'cabinClass': row.cabin_class,
                'milesCost': row.miles_cost,
                'availableSeats': row.available_seats,
                'externalId': row.external_id,
            }
            for row in result['results']
        ],
    }

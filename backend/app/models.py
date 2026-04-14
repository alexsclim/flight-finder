import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


def generate_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = 'user'

    id = Column(String, primary_key=True, default=generate_id)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    notifications_enabled = Column(Boolean, nullable=False, default=True)
    alert_cooldown_minutes = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    alerts = relationship('Alert', back_populates='user')
    search_sessions = relationship('SearchSession', back_populates='user')


class Alert(Base):
    __tablename__ = 'alert'

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    departure_airport = Column(String, nullable=False)
    arrival_airport = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    cabin_classes = Column(JSON, nullable=False)
    airlines = Column(JSON, nullable=False)
    max_miles_cost = Column(Integer, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_checked = Column(DateTime, nullable=True)

    user = relationship('User', back_populates='alerts')
    matches = relationship('AlertMatch', back_populates='alert')


class AlertMatch(Base):
    __tablename__ = 'alert_match'

    id = Column(String, primary_key=True, default=generate_id)
    alert_id = Column(String, ForeignKey('alert.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    airline = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    cabin_class = Column(String, nullable=False)
    miles_cost = Column(Integer, nullable=False)
    available_seat = Column(Boolean, nullable=False, default=True)
    notification_sent = Column(Boolean, nullable=False, default=False)
    notification_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    alert = relationship('Alert', back_populates='matches')


class SearchSession(Base):
    __tablename__ = 'search_session'

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    departure_airport = Column(String, nullable=False)
    arrival_airport = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    cabin_classes = Column(JSON, nullable=False)
    airlines = Column(JSON, nullable=False)
    max_miles_cost = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(minutes=30))

    user = relationship('User', back_populates='search_sessions')
    results = relationship('AvailabilityResult', back_populates='search_session')


class AvailabilityResult(Base):
    __tablename__ = 'availability_result'

    id = Column(String, primary_key=True, default=generate_id)
    search_session_id = Column(String, ForeignKey('search_session.id', ondelete='CASCADE'), nullable=False)
    airline = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    departure_time = Column(String, nullable=True)
    arrival_time = Column(String, nullable=True)
    cabin_class = Column(String, nullable=False)
    miles_cost = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    external_id = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    search_session = relationship('SearchSession', back_populates='results')

from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phoneNumber: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    phoneNumber: Optional[str] = Field(default=None, alias='phone_number')

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class TokenResponse(BaseModel):
    token: str
    user: UserResponse


class AvailabilityResultResponse(BaseModel):
    id: str
    airline: str
    departureDate: datetime
    departureTime: Optional[str] = None
    arrivalTime: Optional[str] = None
    cabinClass: str
    milesCost: int
    availableSeats: int
    externalId: Optional[str] = None

    class Config:
        orm_mode = True


class SearchRequest(BaseModel):
    departureAirport: str
    arrivalAirport: str
    startDate: datetime
    endDate: datetime
    cabinClasses: List[str]
    airlines: List[str]
    maxMilesCost: Optional[int] = None


class SearchSessionSummary(BaseModel):
    id: str
    departureAirport: str
    arrivalAirport: str
    startDate: datetime
    endDate: datetime
    cabinClasses: List[str]
    airlines: List[str]
    maxMilesCost: Optional[int] = None
    createdAt: datetime
    expiresAt: datetime

    class Config:
        orm_mode = True


class SearchSessionResponse(BaseModel):
    session: SearchSessionSummary
    results: List[AvailabilityResultResponse]


class SearchHistoryItem(BaseModel):
    id: str
    departureAirport: str
    arrivalAirport: str
    startDate: datetime
    endDate: datetime
    cabinClasses: List[str]
    airlines: List[str]
    createdAt: datetime
    resultsCount: int

    class Config:
        orm_mode = True


class AlertCreateRequest(BaseModel):
    departureAirport: str
    arrivalAirport: str
    startDate: datetime
    endDate: datetime
    cabinClasses: List[str]
    airlines: List[str]
    maxMilesCost: Optional[int] = None


class AlertUpdateRequest(BaseModel):
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    cabinClasses: Optional[List[str]] = None
    airlines: Optional[List[str]] = None
    maxMilesCost: Optional[int] = None
    active: Optional[bool] = None


class AlertMatchResponse(BaseModel):
    id: str
    airline: str
    departureDate: datetime
    cabinClass: str
    milesCost: int
    availableSeat: bool
    notificationSent: bool
    notificationTime: Optional[datetime] = None
    createdAt: datetime

    class Config:
        orm_mode = True


class AlertResponse(BaseModel):
    id: str
    userId: str
    departureAirport: str
    arrivalAirport: str
    startDate: datetime
    endDate: datetime
    cabinClasses: List[str]
    airlines: List[str]
    maxMilesCost: Optional[int] = None
    active: bool
    createdAt: datetime
    updatedAt: datetime
    lastChecked: Optional[datetime] = None
    matches: Optional[List[AlertMatchResponse]] = None

    class Config:
        orm_mode = True

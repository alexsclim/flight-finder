from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from ..auth import create_access_token, get_password_hash, verify_password
from ..models import User

router = APIRouter()


@router.post('/register', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='User already exists')

    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        phone_number=user_data.phone_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({'id': user.id, 'email': user.email})
    return TokenResponse(token=token, user=UserResponse.from_orm(user))


@router.post('/login', response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    token = create_access_token({'id': user.id, 'email': user.email})
    return TokenResponse(token=token, user=UserResponse.from_orm(user))

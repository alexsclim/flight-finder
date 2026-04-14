import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import auth, search, alerts
from .jobs import start_alert_matcher

app = FastAPI(title='Flight Finder API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth, prefix='/api')
app.include_router(search, prefix='/api')
app.include_router(alerts, prefix='/api')


@app.on_event('startup')
def on_startup():
    init_db()
    asyncio.create_task(start_alert_matcher())


@app.get('/health')
def health_check():
    return {'status': 'ok'}

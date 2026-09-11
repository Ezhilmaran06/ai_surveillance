from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import sqlalchemy
    from .models import SessionModel, ZoneModel, AlertModel, AnalyticsSummaryModel, TrackRecordModel, SettingModel
    Base.metadata.create_all(bind=engine)
    # Automatic migration for is_restricted on existing sqlite database
    with engine.connect() as conn:
        try:
            conn.execute(sqlalchemy.text("ALTER TABLE zones ADD COLUMN is_restricted BOOLEAN DEFAULT 0"))
            conn.commit()
        except Exception:
            pass  # Already present

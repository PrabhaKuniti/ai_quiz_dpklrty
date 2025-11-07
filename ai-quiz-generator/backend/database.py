import os
from datetime import datetime
from sqlalchemy import create_engine, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Mapped, mapped_column
from dotenv import load_dotenv

# Load .env from this backend directory so it works regardless of CWD
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH, override=False)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # Example: postgresql+psycopg2://postgres:postgres@localhost:5432/ai_quiz
    None,
)

if not DATABASE_URL:
    # Defer raising until first use to allow import by tooling without envs
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. Expected a PostgreSQL URL, e.g. "
        "postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DB_NAME"
    )

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base = declarative_base()


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    date_generated: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    scraped_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    full_quiz_data: Mapped[str] = mapped_column(Text, nullable=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)



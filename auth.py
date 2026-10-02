from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = __import__("sqlalchemy").Column(Integer, primary_key=True, index=True)
    username: Mapped[str] = __import__("sqlalchemy").Column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = __import__("sqlalchemy").Column(String(120), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = __import__("sqlalchemy").Column(String(255), nullable=False)
    created_at: Mapped[datetime] = __import__("sqlalchemy").Column(DateTime, default=datetime.utcnow, nullable=False)

    videos: Mapped[list["Video"]] = relationship(back_populates="user")
    jobs: Mapped[list["GenerationJob"]] = relationship(back_populates="user")


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = __import__("sqlalchemy").Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = __import__("sqlalchemy").Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt: Mapped[str] = __import__("sqlalchemy").Column(String(500), nullable=False)
    provider: Mapped[str] = __import__("sqlalchemy").Column(String(50), default="mock", nullable=False)
    duration: Mapped[int] = __import__("sqlalchemy").Column(Integer, default=5, nullable=False)
    aspect_ratio: Mapped[str] = __import__("sqlalchemy").Column(String(20), default="16:9", nullable=False)
    status: Mapped[str] = __import__("sqlalchemy").Column(String(20), default="completed", nullable=False)
    file_name: Mapped[str] = __import__("sqlalchemy").Column(String(255), nullable=False)
    created_at: Mapped[datetime] = __import__("sqlalchemy").Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = __import__("sqlalchemy").Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="videos")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id: Mapped[str] = __import__("sqlalchemy").Column(String(36), primary_key=True, index=True)
    user_id: Mapped[int] = __import__("sqlalchemy").Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt: Mapped[str] = __import__("sqlalchemy").Column(String(500), nullable=False)
    provider: Mapped[str] = __import__("sqlalchemy").Column(String(50), default="mock", nullable=False)
    duration: Mapped[int] = __import__("sqlalchemy").Column(Integer, default=5, nullable=False)
    aspect_ratio: Mapped[str] = __import__("sqlalchemy").Column(String(20), default="16:9", nullable=False)
    status: Mapped[str] = __import__("sqlalchemy").Column(String(20), default="queued", nullable=False)
    file_name: Mapped[str | None] = __import__("sqlalchemy").Column(String(255), nullable=True)
    error: Mapped[str | None] = __import__("sqlalchemy").Column(String(500), nullable=True)
    created_at: Mapped[datetime] = __import__("sqlalchemy").Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = __import__("sqlalchemy").Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="jobs")

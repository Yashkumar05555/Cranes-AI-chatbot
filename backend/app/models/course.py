from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g. 'general', 'embedded_systems'
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    duration: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    highlights: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    key_skills: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    sample_questions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    conversations: Mapped[list["Conversation"]] = relationship("Conversation", back_populates="course")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="course")

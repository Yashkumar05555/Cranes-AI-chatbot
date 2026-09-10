from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CourseResponse(BaseModel):
    id: str
    code: str
    title: str
    category: str
    duration: str
    description: str
    highlights: List[str]
    keySkills: List[str]  # camelCase for frontend compatibility
    sampleQuestions: List[str]
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_course(cls, course):
        # Map snake_case DB fields to camelCase response
        return cls(
            id=course.id,
            code=course.code,
            title=course.title,
            category=course.category,
            duration=course.duration,
            description=course.description,
            highlights=course.highlights or [],
            keySkills=course.key_skills or [],
            sampleQuestions=course.sample_questions or [],
            created_at=course.created_at,
        )

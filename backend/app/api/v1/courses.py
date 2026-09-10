from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.course import CourseResponse
from app.services.course_service import list_courses

router = APIRouter()


@router.get("", response_model=List[CourseResponse], summary="List available courses")
@router.get("/", response_model=List[CourseResponse], summary="List available courses", include_in_schema=False)
async def get_courses(db: AsyncSession = Depends(get_db)):
    """
    List available courses for the frontend course selector.
    Public endpoint - no auth required for course discovery.
    Returns course metadata needed by frontend: id, code, title, category, duration, etc.
    """
    courses = await list_courses(db)
    return [CourseResponse.from_orm_course(c) for c in courses]

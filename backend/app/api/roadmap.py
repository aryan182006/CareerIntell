import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.schemas.roadmap import (
        RoadmapResponse, RoadmapItemResponse, RoadmapResource, RoadmapItemStatusUpdate
    )
    from app.services.roadmap_service import RoadmapService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.schemas.roadmap import (
        RoadmapResponse, RoadmapItemResponse, RoadmapResource, RoadmapItemStatusUpdate
    )
    from backend.app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

def serialize_roadmap(roadmap) -> RoadmapResponse:
    items = []
    for item in roadmap.items:
        res_list = []
        try:
            res_list = json.loads(item.resources) if item.resources else []
        except Exception:
            res_list = []

        resources = [
            RoadmapResource(
                title=r.get("title", ""),
                provider=r.get("provider", ""),
                url=r.get("url", ""),
                type=r.get("type", "Course")
            )
            for r in res_list
        ]

        items.append(
            RoadmapItemResponse(
                id=item.id,
                phase=item.phase,
                title=item.title,
                description=item.description,
                category=item.category,
                duration=item.duration,
                status=item.status,
                order_index=item.order_index,
                resources=resources
            )
        )

    return RoadmapResponse(
        id=roadmap.id,
        target_role_title=roadmap.target_role_title,
        completion_percentage=roadmap.completion_percentage,
        items=items
    )

@router.get("", response_model=RoadmapResponse)
async def get_roadmap(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    roadmap = await RoadmapService.get_or_create_roadmap(db, profile)
    return serialize_roadmap(roadmap)

@router.put("/items/{item_id}", response_model=RoadmapResponse)
async def update_roadmap_item(
    item_id: str,
    req: RoadmapItemStatusUpdate,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    await RoadmapService.update_item_status(db, item_id, req.status)
    roadmap = await RoadmapService.get_or_create_roadmap(db, profile)
    return serialize_roadmap(roadmap)

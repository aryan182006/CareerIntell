from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class RoadmapResource(BaseModel):
    title: str
    provider: str
    url: str
    type: str

class RoadmapItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phase: str
    title: str
    description: str
    category: str
    duration: str
    status: str  # NOT_STARTED, IN_PROGRESS, COMPLETED
    order_index: int
    resources: List[RoadmapResource] = []

class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    target_role_title: str
    completion_percentage: float
    items: List[RoadmapItemResponse] = []

class RoadmapItemStatusUpdate(BaseModel):
    status: str  # NOT_STARTED, IN_PROGRESS, COMPLETED

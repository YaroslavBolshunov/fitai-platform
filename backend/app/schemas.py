from typing import List
from pydantic import BaseModel, Field, ConfigDict


class Workout(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    category: str
    durationMinutes: int = Field(alias='duration_minutes')
    setsReps: str = Field(alias='sets_reps')
    difficulty: str
    equipment: List[str]
    muscles: List[str]
    goals: List[str]
    steps: List[str]
    mistakes: List[str]


class AskRequest(BaseModel):
    query: str


class AskResponse(BaseModel):
    answer: str
    sources: List[Workout] = []
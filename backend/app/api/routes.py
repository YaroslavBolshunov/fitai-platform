from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..schemas import Workout, AskRequest, AskResponse
from ..services.parser import get_workouts_cached
from ..services.rag import answer_question, stream_question

router = APIRouter(prefix='/api')


@router.get('/workouts', response_model=List[Workout])
def list_workouts():
    return get_workouts_cached()


@router.get('/workouts/{workout_id}', response_model=Workout)
def get_workout(workout_id: str):
    for w in get_workouts_cached():
        if w['id'] == workout_id:
            return w
    raise HTTPException(status_code=404, detail='Workout not found')


@router.post('/ask/stream')
def ask_stream(payload: AskRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail='Query is empty')
    return StreamingResponse(
        stream_question(payload.query),
        media_type='text/event-stream',
    )
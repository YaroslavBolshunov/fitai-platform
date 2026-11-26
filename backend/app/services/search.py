from sentence_transformers import SentenceTransformer
import chromadb
from .parser import get_workouts_cached

_model = None
_collection = None


def _init():
    global _model, _collection
    if _model is None:
        _model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    if _collection is None:
        client = chromadb.Client()
        _collection = client.get_or_create_collection('workouts')

    workouts = get_workouts_cached()
    if _collection.count() == 0 and workouts:
        for w in workouts:
            muscles_str = ', '.join(w.get('muscles', []))
            equip_str = ', '.join(w.get('equipment', []))
            text = (
                f"{w['name']} ({w['category']}). "
                f"Мышцы: {muscles_str}. Инвентарь: {equip_str}. {w['body']}"
            )
            emb = _model.encode(text).tolist()
            _collection.add(
                ids=[w['id']],
                embeddings=[emb],
                documents=[text],
                metadatas=[{'name': w['name']}],
            )


def semantic_search(query: str, top_k: int | None = None):
    _init()
    workouts = get_workouts_cached()
    if not workouts:
        return []

    limit = len(workouts) if top_k is None else min(top_k, len(workouts))
    emb = _model.encode(query).tolist()
    res = _collection.query(
        query_embeddings=[emb],
        n_results=limit,
    )
    return [
        {'id': res['ids'][0][i], 'name': res['metadatas'][0][i]['name']}
        for i in range(len(res['ids'][0]))
    ]
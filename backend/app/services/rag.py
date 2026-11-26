import os
import json
from openai import OpenAI
from .search import semantic_search
from .parser import get_workouts_cached


SYSTEM_PROMPT = (
    'Ты — персональный ИИ-тренер FitAI. Отвечай на русском языке, структурированно '
    'в формате Markdown (списки, выделение ключевых моментов). '
    'СТРОГОЕ ПРАВИЛО: используй ТОЛЬКО упражнения из переданного ниже списка базы знаний. '
    'Категорически запрещено придумывать или добавлять упражнения, которых нет в списке. '
    'Из переданного списка отбери только те упражнения, которые точно подходят под запрос '
    'пользователя (целевые мышцы, инвентарь, цель), а остальные проигнорируй. '
    'Если подходящих упражнений в списке действительно нет — честно скажи об этом.'
)


def _prepare_context(question: str):
    hits = semantic_search(question)
    hit_ids = [h['id'] for h in hits]
    workouts_map = {w['id']: w for w in get_workouts_cached()}
    matched_workouts = [workouts_map[wid] for wid in hit_ids if wid in workouts_map]

    context = '\n\n'.join(
        f"### {w['name']} (категория: {w['category']}, режим: {w['sets_reps']})\n{w['body']}"
        for w in matched_workouts
    )
    user_prompt = (
        f'Упражнения из базы знаний:\n{context}\n\nВопрос пользователя: {question}'
        if context
        else question
    )
    return matched_workouts, user_prompt


def answer_question(question: str) -> dict:
    matched_workouts, user_prompt = _prepare_context(question)
    lm_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234/v1')
    lm_model = os.getenv('LM_STUDIO_MODEL', 'local-model')

    try:
        client = OpenAI(base_url=lm_url, api_key='lm-studio')
        resp = client.chat.completions.create(
            model=lm_model,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_prompt},
            ],
            temperature=0.4,
        )

        answer_text = resp.choices[0].message.content
        answer_lower = answer_text.lower()
        used_workouts = [
            w for w in matched_workouts if w['name'].lower() in answer_lower
        ]

        return {
            'answer': answer_text,
            'sources': used_workouts,
        }
    except Exception as e:
        print(f'[RAG Warning] LM Studio недоступна ({e}), используется fallback.')

    fallback_workouts = matched_workouts[:2]
    if not fallback_workouts:
        return {
            'answer': 'Ничего не найдено по вашему запросу. Попробуйте уточнить группу мышц или инвентарь.',
            'sources': [],
        }

    names = ', '.join(f"**{w['name']}**" for w in fallback_workouts)
    return {
        'answer': (
            f'Локальная LLM сейчас не запущена, но по семанческому поиску в базе '
            f'подходят: {names}.\n\nОткройте любую карточку ниже, чтобы посмотреть технику.'
        ),
        'sources': fallback_workouts,
    }


def stream_question(question: str):
    matched_workouts, user_prompt = _prepare_context(question)
    lm_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234/v1')
    lm_model = os.getenv('LM_STUDIO_MODEL', 'local-model')

    try:
        client = OpenAI(base_url=lm_url, api_key='lm-studio')
        stream = client.chat.completions.create(
            model=lm_model,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_prompt},
            ],
            temperature=0.4,
            stream=True,
        )

        full_answer = ''
        for chunk in stream:
            delta = chunk.choices[0].delta.content or ''
            if delta:
                full_answer += delta
                yield f"data: {json.dumps({'type': 'chunk', 'content': delta}, ensure_ascii=False)}\n\n"

        answer_lower = full_answer.lower()
        used_workouts = [
            w for w in matched_workouts if w['name'].lower() in answer_lower
        ]
        yield f"data: {json.dumps({'type': 'sources', 'sources': used_workouts}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
        return

    except Exception as e:
        print(f'[RAG Stream Warning] LM Studio недоступна ({e}), используется fallback.')

    fallback_workouts = matched_workouts[:2]
    if not fallback_workouts:
        fallback_text = 'Ничего не найдено по вашему запросу. Попробуйте уточнить группу мышц или инвентарь.'
    else:
        names = ', '.join(f"**{w['name']}**" for w in fallback_workouts)
        fallback_text = (
            f'Локальная LLM сейчас не запущена, но по семанческому поиску в базе '
            f'подходят: {names}.\n\nОткройте любую карточку ниже, чтобы посмотреть технику.'
        )

    yield f"data: {json.dumps({'type': 'chunk', 'content': fallback_text}, ensure_ascii=False)}\n\n"
    yield f"data: {json.dumps({'type': 'sources', 'sources': fallback_workouts}, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"
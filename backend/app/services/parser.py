import os
from functools import lru_cache
import frontmatter

WORKOUTS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'workouts')


def load_workouts():
    workouts = []
    if not os.path.exists(WORKOUTS_DIR):
        return workouts

    for filename in sorted(os.listdir(WORKOUTS_DIR)):
        if not filename.endswith('.md'):
            continue
        path = os.path.join(WORKOUTS_DIR, filename)
        with open(path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)

        meta = dict(post.metadata)
        meta.setdefault('id', filename[:-3].replace('_', '-'))
        meta.setdefault('equipment', [])
        meta.setdefault('muscles', [])
        meta.setdefault('goals', [])
        meta.setdefault('steps', [])
        meta.setdefault('mistakes', [])
        meta['body'] = post.content
        workouts.append(meta)

    return workouts


@lru_cache(maxsize=1)
def get_workouts_cached():
    return load_workouts()
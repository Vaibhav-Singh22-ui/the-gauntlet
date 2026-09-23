import json
import math

all_hard_questions = []

def make_q(qid, lvl, col, cat, text, a, b, c, d, corr, hint, sec=55):
    opts = [str(a).strip(), str(b).strip(), str(c).strip(), str(d).strip()]
    assert len(set(opts)) == 4, f"Duplicate options in {qid}: {opts}"
    assert corr in ['A', 'B', 'C', 'D'], f"Bad correct option in {qid}: {corr}"
    return {
        "external_id": qid,
        "question_text": text.strip(),
        "option_a": opts[0],
        "option_b": opts[1],
        "option_c": opts[2],
        "option_d": opts[3],
        "correct_option": corr,
        "hint_text": hint.strip(),
        "level": lvl,
        "color": col,
        "category": cat,
        "difficulty": "HARD",
        "expected_solve_seconds": sec,
        "verification_status": "VERIFIED",
        "active": True,
        "source_type": "HIGH_DIFFICULTY_MASTER_BANK",
        "source_reference": f"Level {lvl} {col} High Difficulty Tier"
    }

# Import L4 and L5 already built
from generate_complete_hard_bank import questions as l4_qs
from create_hard_questions_dataset import generate_dataset as l5_qs_gen

all_hard_questions.extend(l4_qs)
all_hard_questions.extend(l5_qs_gen())
print(f"Loaded L4 and L5: {len(all_hard_questions)} questions")

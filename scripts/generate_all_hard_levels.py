import json

questions = []

def add(qid, level, color, cat, text, opt_a, opt_b, opt_c, opt_d, correct, hint, sec=55):
    opts = [str(opt_a).strip(), str(opt_b).strip(), str(opt_c).strip(), str(opt_d).strip()]
    assert len(set(opts)) == 4, f"Options not unique for {qid}: {opts}"
    assert correct in ['A', 'B', 'C', 'D'], f"Invalid correct option {correct} in {qid}"
    questions.append({
        "external_id": qid,
        "question_text": text.strip(),
        "option_a": opts[0],
        "option_b": opts[1],
        "option_c": opts[2],
        "option_d": opts[3],
        "correct_option": correct,
        "hint_text": hint.strip(),
        "level": level,
        "color": color,
        "category": cat,
        "difficulty": "HARD",
        "expected_solve_seconds": sec,
        "verification_status": "VERIFIED",
        "active": True,
        "source_type": "HIGH_DIFFICULTY_MASTER_BANK",
        "source_reference": f"Level {level} {color} Expert Tier"
    })

# We will define a structured function for each level
# Let's import the Level 4 questions we already made
import sys
sys.path.append('.')
from generate_complete_hard_bank import questions as l4_questions

questions.extend(l4_questions)
print(f"Loaded Level 4: {len(questions)} questions")

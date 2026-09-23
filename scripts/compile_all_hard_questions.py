import json
import sys

from generate_complete_hard_bank import questions as l4
from create_hard_questions_dataset import generate_dataset as l5_gen
from generate_levels_6_to_15 import generate_l6_to_l15 as l6_gen
from generate_levels_7_to_15 import generate_l7_to_l15 as l7_gen
from generate_all_master_pack import build_all as l8_15_gen

all_hard = []
all_hard.extend(l4)
all_hard.extend(l5_gen())
all_hard.extend(l6_gen())
all_hard.extend(l7_gen())
all_hard.extend(l8_15_gen())

print(f"Total high-difficulty questions compiled: {len(all_hard)}")

# Check duplicates within all_hard
seen = set()
dups = []
cleaned = []
for q in all_hard:
    t = q["question_text"].strip().lower()
    if t in seen:
        dups.append(q["external_id"])
    else:
        seen.add(t)
        cleaned.append(q)

print(f"Duplicates found: {len(dups)}")
print(f"Total unique hard questions: {len(cleaned)}")

# Verify distribution by level and color
by_level = {}
for q in cleaned:
    lvl = q["level"]
    col = q["color"]
    if lvl not in by_level:
        by_level[lvl] = {}
    by_level[lvl][col] = by_level[lvl].get(col, 0) + 1

for lvl in sorted(by_level.keys()):
    cols = by_level[lvl]
    tot = sum(cols.values())
    print(f"Level {lvl:2d}: Total = {tot:3d} | " + ", ".join(f"{c}: {cols.get(c,0)}" for c in ['RED','BLUE','GREEN','YELLOW','PINK','VIOLET']))

with open("hard_questions_720.json", "w", encoding="utf-8") as f:
    json.dump(cleaned, f, indent=2)

print("Saved cleanly to hard_questions_720.json!")

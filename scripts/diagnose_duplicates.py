import json
import sys
from collections import defaultdict

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

text_map = defaultdict(list)
for q in all_hard:
    text_map[q["question_text"].strip().lower()].append(q["external_id"])

duplicates = {text: ids for text, ids in text_map.items() if len(ids) > 1}
print(f"Total distinct texts that duplicate: {len(duplicates)}")
for text, ids in duplicates.items():
    print(f"Text: '{text[:60]}...' -> IDs: {ids}")

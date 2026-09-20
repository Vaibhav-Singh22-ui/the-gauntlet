# ₹50 Challenge — Game Rules

## Locked Rules

1. Entry fee is ₹50.
2. Entry fee is collected manually by an operator.
3. Entry fee and rewards are financially separate.
4. There are exactly 15 levels in the current version.
5. Each level requires exactly one correct answer to progress.
6. Each question has a 60-second timer.
7. Wheel animation occurs before the question and does not consume question time.
8. The wheel stops on a color.
9. The server randomly selects one question from that level + color pool.
10. All categories may be present inside a color pool.
11. A question answer is final immediately after selection.
12. Wrong answer results in ₹0 and Game Over.
13. Timeout results in ₹0 and Game Over.
14. Correct answer unlocks the next level.
15. The previous reward is fully at risk when entering the next level.
16. Failure at the next level destroys the previously accumulated reward.
17. There is no partial cash protection in the current version.
18. One Hint is available per game.
19. One 50:50 is available per game.
20. Lifelines can only be used after the timer starts.
21. Hint gives only a tiny non-revealing clue.
22. 50:50 removes two incorrect choices.
23. Lifelines cannot be replenished in a game.
24. Level 15 correct answer completes the game and awards ₹150.
25. Easy questions are restricted to Levels 1–5.
26. Levels 6–15 contain no questions classified as Easy.
27. The player should not receive the same question twice in one session.
28. The full question bank must never be sent to the client.
29. The answer must be validated server-side.
30. Operator payment verification is manual in the current version.

## Reward Ladder

Level 1: ₹10
Level 2: ₹20
Level 3: ₹30
Level 4: ₹40
Level 5: ₹50
Level 6: ₹60
Level 7: ₹70
Level 8: ₹80
Level 9: ₹90
Level 10: ₹100
Level 11: ₹110
Level 12: ₹120
Level 13: ₹130
Level 14: ₹140
Level 15: ₹150

## Risk Example

Player has successfully completed Level 7 and has ₹70 at risk.

They choose:
🔥 RISK IT — NEXT LEVEL

At Level 8:
- Correct → progress to Level 9.
- Wrong → ₹0.
- Timeout → ₹0.

The ₹70 is not protected.

## Wheel Rule

The wheel is a visual randomizer for color selection.

Color does not equal a single question.

Color identifies a question pool.

Example:
Level 10 + Red → 100 eligible questions.

Wheel → Red → server randomly selects one of the eligible questions.

The visible wheel must not expose the question bank.

## Anti-Abuse Rules

- A player cannot directly request an arbitrary question ID.
- Server validates level and session state.
- Server validates that the selected question belongs to the session's level and selected color.
- A question marked inactive cannot be selected.
- A used question is not selected again in the same session.
- Answer submissions must be tied to the active question/session.
- Replaying an old answer submission must not change the game state.

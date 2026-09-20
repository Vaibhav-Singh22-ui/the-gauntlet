# ₹50 Challenge — Design System

## 1. Design Goal

Create a premium, cinematic, competitive game-show/arcade experience.

The player should feel:
- Pressure
- Anticipation
- Risk
- Reward
- Excitement
- Intelligence/skill
- Humor

The interface must not look like a generic quiz, SaaS dashboard, educational platform or casino.

## 2. Visual Direction

Preferred:
- Dark cinematic environment
- High contrast
- White/light primary typography
- Gold/amber reward emphasis
- Strong danger red
- Distinct wheel colors
- Controlled particles
- Subtle depth and shadows
- Crisp arcade/game-show presentation

Avoid:
- Purple/blue AI gradients
- Generic AI neon aesthetics
- Excessive gradients
- Glassmorphism everywhere
- Excessive glow
- Childish cartoon styling
- Casino imagery
- Unnecessary decorative cards

## 3. Wheel

The wheel is a major hero interaction.

Colors:
- Red
- Blue
- Green
- Yellow
- Pink
- Violet

The wheel should have:
- Clearly separated color segments
- Center hub
- Fixed pointer
- Tick/stop sound
- Accelerate → fast spin → deceleration → final stop
- Strong anticipation during the last rotations
- Clear final color indication

The wheel must feel physical and believable.

Do not use a simplistic instant random-color animation.

## 4. Question Reveal

After wheel stops:
- Short pause
- Color confirmation
- Question card enters
- Options reveal
- Timer activates

Question reveal should feel like a game-show reveal, not a page navigation.

## 5. Timer

The timer should be visually dominant but not distracting.

Suggested behavior:
- Normal countdown
- Subtle urgency after 20 seconds
- Stronger visual/audio urgency under 10 seconds
- Final seconds should feel intense
- Timeout should have an immediate visual/audio reaction

## 6. Reward

Current reward should be visible.

Example:
`₹70`

When the player is about to continue:
- Reward becomes visually "at risk"
- Risk state should intensify
- Use short copy such as:
  `₹70 AT RISK`

Primary action:
`🔥 RISK IT — NEXT LEVEL`

Avoid long explanatory text.

## 7. Answer Options

Four large, clear options.

They should:
- Be immediately clickable
- Have strong selected state
- Have clear disabled state
- React quickly
- Avoid accidental double selection

After selection:
- Lock all choices
- Short anticipation pause
- Correct/wrong reveal

## 8. Lifelines

Display:
- `HINT`
- `50:50`

Show remaining availability clearly.

After use:
- Disable permanently for that session.

Hint UI should show a very small clue, not a solution.

## 9. Wrong Answer Experience

Sequence:

Answer selected
→ short silence/pause
→ visual reaction
→ funny fail sound
→ wrong animation
→ `WRONG`
→ `GAME OVER`

Loss audio should be short, funny and legally usable.

Do not overuse memes.

## 10. Correct Answer Experience

Sequence:

Answer selected
→ anticipation
→ correct sound
→ visual confirmation
→ reward emphasis
→ next-level risk state

The player should feel a clear release of tension before the next risk decision.

## 11. Level Transitions

Each level should feel like advancement.

Use:
- Level number
- Difficulty feeling through visual intensity
- Short title
- Reward
- Transition animation

Avoid large explanatory paragraphs.

## 12. Level 15

Level 15 should feel substantially different:
- Stronger visual intensity
- Special wheel treatment if appropriate
- More dramatic reveal
- Victory sequence after correct answer
- ₹150 hero reward

## 13. Typography

Use a bold modern display style for:
- Level
- Reward
- Timer
- Major feedback

Use highly readable text for:
- Questions
- Options
- Lifeline hints

Avoid decorative fonts that reduce readability.

## 14. Layout

Gameplay should fit a laptop viewport without requiring scrolling.

Priority order:
1. Level/reward
2. Wheel or question
3. Timer
4. Question
5. Options
6. Lifelines
7. Primary action

## 15. Motion

Motion should communicate state.

Examples:
- Wheel spin = anticipation
- Question reveal = discovery
- Correct = release/reward
- Wrong = shock/comedy
- Risk = danger
- Victory = celebration

Avoid continuous decorative motion that distracts from gameplay.

Respect reduced-motion preferences where possible.

## 16. Copy Style

Use short copy:
- READY?
- LEVEL 1
- SPIN
- 60 SEC
- CORRECT!
- WRONG!
- TIME'S UP!
- ₹10
- ₹70 AT RISK
- 🔥 RISK IT — NEXT LEVEL
- GAME OVER
- CHALLENGE COMPLETE
- ₹150

Do not put paragraphs on gameplay screens.

## 17. Responsive Behavior

Primary target is desktop/laptop.

Support:
- 1366x768
- 1440x900
- 1920x1080

Also provide a reasonable fallback for smaller screens.

## 18. Accessibility

Maintain:
- High contrast
- Keyboard accessibility where practical
- Clear focus states
- Text alternatives where visual information alone is insufficient
- Audio never required to understand game state
- Do not use color alone for critical feedback

## 19. Operator UI

Operator dashboard can be information-dense but should remain clean.

Unlike player mode, operator mode may use:
- Tables
- Filters
- Search
- Forms
- Status labels
- Usage statistics

Do not leak the operator UI into player mode.

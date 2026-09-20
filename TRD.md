# ₹50 Challenge — Technical Requirements Document

## 1. Stack

- Next.js
- React
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase MCP for development/agent database workflows
- Vercel for production hosting
- CSS and/or a suitable animation library for game animation
- Browser audio APIs/files for sound

## 2. Architecture

Use Next.js as the full-stack application layer.

Use Supabase as:
- PostgreSQL database
- Authentication provider
- Persistent storage/data layer
- Secure backend data source

Use Vercel for:
- Production deployment
- Next.js hosting
- Server-side application execution where appropriate

Supabase MCP is a development/agent integration. It is not itself the production runtime API.

## 3. Security Principle

Never expose the full question bank to the client.

Do not place questions in a public static file such as:
- questions.ts
- questions.json
- questions.js

Production question selection must happen server-side.

The browser receives only the currently active question needed for gameplay.

The correct answer should not be sent to the browser before answer submission.

## 4. Suggested Routes

### Player
- `/`
- `/game`
- `/game/[sessionId]` or an equivalent protected game-session architecture

### Operator
- `/operator/login`
- `/operator`
- `/operator/questions`
- `/operator/questions/new`
- `/operator/questions/[id]`
- `/operator/sessions`
- `/operator/settings`

Exact route structure can be adjusted during implementation.

## 5. Authentication

Use Supabase Auth for operator authentication.

Operator pages must be protected server-side.

Do not rely on:
- hidden buttons
- client-only role checks
- localStorage role flags
- frontend route hiding

for authorization.

Use database-level security policies/RLS where appropriate.

## 6. Database Model

### questions

Suggested fields:

- id
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_option
- hint_text
- level
- color
- category
- difficulty
- expected_solve_seconds
- active
- times_used
- created_at
- updated_at
- created_by
- source_notes/internal_reference
- verification_status

Never expose `correct_option` through public/player queries.

### game_sessions

Suggested fields:

- id
- operator_id
- status
- current_level
- current_reward
- lifeline_hint_available
- lifeline_fifty_fifty_available
- started_at
- ended_at
- final_reward
- final_level
- result
- created_at

### game_questions / session_questions

Stores the questions selected for a session.

Suggested:
- id
- session_id
- question_id
- level
- selected_color
- presented_at
- answered_at
- answer
- result
- time_remaining
- lifeline_hint_used
- lifeline_fifty_fifty_used

### operators

Can be implemented through Supabase Auth plus profile/role metadata.

Suggested:
- id
- auth_user_id
- role
- active
- created_at

## 7. Question Selection Algorithm

When a level starts:

1. Client requests/initiates wheel phase.
2. Server/session state establishes the level.
3. Wheel animation runs.
4. The wheel produces a color result.
5. Client submits the selected color with session context.
6. Server validates that the color is valid.
7. Server finds active questions matching:
   - current level
   - selected color
   - valid verification status
   - not already used in current session
8. Server randomly selects one.
9. Server records session-question association.
10. Server returns only safe player-facing question data:
    - question
    - options
    - hint
    - metadata required by UI
11. Correct answer remains server-side.

If the pool is exhausted, the server must use a deterministic fallback policy defined by the product configuration rather than returning a random invalid question.

## 8. Randomness

Do not rely on client-side randomness for authoritative question selection.

The client can animate the wheel based on a server-authorized result.

The authoritative color/question selection should be server-controlled.

The visual wheel should not be allowed to select a question outside the server-approved state.

## 9. Session State

Use a server-trusted state machine.

Suggested states:

- CREATED
- LEVEL_INTRO
- WHEEL
- QUESTION_ACTIVE
- ANSWER_SUBMITTED
- CORRECT
- GAME_OVER
- RISK_DECISION
- COMPLETED

Transitions must be validated server-side.

Do not trust the client to tell the server:
- current level
- current reward
- whether an answer is correct
- whether a lifeline is available
- whether a question is active

## 10. Timer

The client timer is visual.

The server should retain enough timestamp/session information to reject obviously invalid submissions and prevent trivial timer bypasses.

Store:
- question presented time
- answer submitted time

Do not depend entirely on JavaScript countdown state for game integrity.

## 11. Answer Validation

Client sends:
- session ID
- active question/session-question ID
- selected option

Server:
1. Verifies authenticated/session identity.
2. Verifies question is active in the session.
3. Verifies the question is at the current level.
4. Verifies it has not already been answered.
5. Checks server-side correct answer.
6. Checks timing/state.
7. Updates game state atomically.
8. Returns correct/incorrect outcome.

## 12. Lifeline Validation

### Hint
Server verifies:
- hint is still available
- question is active
- session is valid

Then marks hint as used.

### 50:50
Server verifies availability and returns which two incorrect choices are removed.

Do not make 50:50 dependent on a client-only random calculation.

## 13. Risk Transition

When a player answers correctly:

- Update the session as eligible for the next level.
- Display reward state.
- Require explicit risk/continue action.

If player continues:
- increment level
- set new level reward
- start next wheel phase

If player exits/takes reward in a future version:
- finalize session at the current reward.

Current game design is focused on `RISK IT — NEXT LEVEL`; a separate take-reward action may be added if later approved.

## 14. Idempotency and Double Click Protection

Answer submission and critical game transitions must be idempotent.

Rapid repeated clicks must not:
- submit two answers
- consume a lifeline twice
- skip levels
- award reward twice
- create multiple active questions

Disable/lock relevant UI after action and enforce the rule server-side.

## 15. Operator Question Management

Operators can:
- Create question
- Edit question
- Disable question
- View question
- Filter by level
- Filter by color
- Filter by category
- Filter by difficulty
- View verification status
- View usage count

Deleting questions should generally be avoided if they have historical usage. Prefer disabling/archiving.

## 16. Question Import

The system should eventually support bulk import using a controlled format such as CSV/JSON.

Import must validate:
- required fields
- four options
- one correct answer
- valid level
- valid color
- valid category
- valid difficulty
- hint presence
- duplicate detection

## 17. Scalability

The initial target is 1,000+ questions.

Architecture should comfortably support several thousand questions.

Index database queries around:
- level
- color
- active
- verification status
- question ID
- session ID

Avoid loading large pools into the client.

## 18. Observability

Track:
- game sessions
- question usage
- level reached
- outcomes
- lifeline usage
- time remaining
- reward
- errors

Do not store unnecessary sensitive personal information.

## 19. Deployment

Development:
- Antigravity
- local Next.js development
- Supabase development project

Production:
- Vercel
- Supabase production project

Use separate development/production environments where practical.

## 20. Environment Variables

Secrets must never be hardcoded.

Expected environment variables may include:
- Supabase URL
- Supabase public key
- server-only Supabase credentials where legitimately required

Never expose service-role secrets to client bundles.

## 21. Testing

Test:
- Level progression
- Wheel/color flow
- Question selection
- No duplicate question in session
- Correct answer
- Wrong answer
- Timeout
- Hint
- 50:50
- Lifeline exhaustion
- Level 15 victory
- Reward calculation
- Risk reset to ₹0
- Rapid clicking
- Refresh/reconnect behavior
- Unauthorized operator access
- Direct route access
- Question pool exhaustion
- Disabled questions
- Large question bank
- Concurrent sessions

## 22. Development Principle

Antigravity must implement incrementally:

Plan
→ build
→ run
→ inspect
→ test
→ identify defects
→ fix
→ repeat

Do not stop after a visually acceptable first pass.

The actual working product is the success criterion.

# ₹50 Challenge

A physical-event, skill-and-luck game built with Next.js, Supabase and Vercel.

## Current Product

- ₹50 manual entry
- 15 levels
- ₹10 → ₹150 reward ladder
- One question per level
- 60 seconds per question
- Color-based wheel
- Server-side random question selection
- One Hint + one 50:50 per game
- All-or-nothing risk
- 1,000+ question-bank target
- Secure operator management

## Technology

- Next.js
- React
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase MCP for development
- Vercel

## Documentation

- `PRD.md` — product requirements
- `GAME_RULES.md` — game rules
- `TRD.md` — technical architecture
- `DESIGN.md` — visual/UX system
- `QUESTION_BANK_GUIDE.md` — question-bank rules

## Source of Truth

These documents are the product source of truth.

Antigravity must:
1. Read all documentation before implementing.
2. Never invent contradictory product rules.
3. Keep money/reward logic server-trusted.
4. Keep the full question bank server-side.
5. Build incrementally.
6. Run and test the real application.
7. Inspect gameplay visually.
8. Fix logic, UX, animation and security issues.
9. Re-test after fixes.

If an important requirement is ambiguous, flag it before making a destructive product decision.

## Current Status

Documentation phase.

Do not generate the complete 1,000+ question bank yet.

Next planned work:
1. Finalize remaining operator/access decisions.
2. Finalize database schema.
3. Finalize wheel mechanics and exact segment behavior.
4. Finalize game state machine.
5. Finalize design details.
6. Implement foundation.
7. Build/test question-bank tooling.
8. Generate verified question batches.
9. Deploy to Vercel.

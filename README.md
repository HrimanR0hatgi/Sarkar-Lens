# Sarkar Lens

A prototype full-stack application that converts a natural-language life event into a personalized government-service checklist without letting the AI invent procedures, requirements, dependencies, or official URLs.

## Architecture

- `client/` — React + Vite UI
- `server/` — Express REST API
- `server/src/ai/` — AI/parser abstraction and deterministic mock parser
- `server/src/rules/` — rules/dependency selection engine
- `server/src/db/` — SQLite persistence
- `server/data/services.json` — structured government-service knowledge base

The core data flow is:

`Natural language -> parser -> validated facts -> rules engine -> service records -> personalized checklist`

The parser never supplies service URLs or procedures. Those are read from the service database.

## Run

Requirements: Node.js 20+.

```bash
npm run install-all
npm run dev
```

Open `http://localhost:5173`.

The API runs at `http://localhost:4000`.

## Demo

Paste:

> I'm moving from Noida to Bengaluru. I'm renting and I don't own a car.

The deterministic parser extracts the move, origin, destination, rental status and absence of a vehicle. The rules engine therefore excludes the vehicle-registration service. The demo asks about voter registration because that fact changes whether the voter-address service applies.

## AI provider integration

Replace `parseSituation()` in `server/src/ai/parser.js` with a provider call. Keep the same contract:

```js
{
  life_event,
  origin,
  destination,
  age,
  owns_vehicle,
  housing,
  voter_registered,
  lost_document_type,
  marriage_state,
  changed_name
}
```

The result must pass `FactsSchema.parse()` before the rules engine consumes it.

## Knowledge-base safety

Every service record has `verification_status` and `last_verified`. Unverified prototype records have `official_url: null`; the UI intentionally blocks the official-service button for those records.

Do not add government URLs from model output. Add them to `server/data/services.json` only after verification against the relevant government authority.

## Production gaps

This prototype deliberately does not pretend to be a complete India-wide government-services directory. A production system needs:

- jurisdiction-specific service records
- stronger address/city/state normalization
- source snapshots and automated verification workflows
- authenticated user accounts
- encrypted/persistent session storage
- an actual LLM provider with strict JSON schema output
- robust URL/domain validation and allowlisting
- audit logs for knowledge-base changes
- comprehensive tests for rules and service applicability
- a real graph visualization library if the dependency graph becomes large

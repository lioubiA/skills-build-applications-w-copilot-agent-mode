# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record the implementation plan before editing code.

- Presentation tier decision: Keep the existing React/Vite structure and shared API client. Implement the Activities, Teams, Leaderboard, and Workout Suggestions views to fetch from the existing `/api` endpoints and display results and errors.
- Logic tier decision: Keep the existing API routes and service layer. Implement the service functions called by the routes in `backend/src/services/octofitService.ts`: create and list activities and teams, calculate the leaderboard, and generate workout suggestions. Validate inputs and return deliberate 4xx errors for invalid or unknown records rather than exposing database errors as 500s.
- Data tier decision: Complete the Mongoose models with the fields, references, defaults, and validation required by the API contract. Keep seed data usable and repeatable.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate that both IDs are valid and refer to existing records. Save the user/team references and calculate `points` and `occurredAt` when creating an activity.
- Team management approach: Create teams with the submitted `name` and `mascot`, and support members using user references. Reject a missing team name with `400`; return team data from the list endpoint.
- Leaderboard approach: Calculate each team’s total from its activities’ points, sort highest first, and return `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: Find the user by email, then use their goal or recent activity to choose a relevant suggestion. Include a `reason` explaining the match; return a deliberate 4xx response if no user matches.

## Test plan

Record the commands you run, their results, and what any failures mean.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — verifies model fields, references, validation, and seed behavior; failures indicate a data contract or seed issue.
- API command: `npm run test:api --prefix octofit-tracker/backend` — verifies activity and team creation/listing, invalid-input responses, leaderboard ranking, and workout suggestions; failures indicate missing or incorrect service/API behavior.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — verifies pages display API data and support expected interactions and error states; failures indicate presentation or API-client integration issues.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — should complete without TypeScript errors; failures indicate backend compilation or type errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — should complete successfully; failures indicate frontend compilation or bundling errors.

Implement in dependency order: data models, service logic/API behavior, then frontend views. Run the corresponding tests after each tier before proceeding.

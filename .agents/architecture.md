## Practises
# Code Practices
*   *TDD:* Write tests that check if the expected functionality works, before writing the code itself. Afterwards, of course, code should be checked
*   *Clean code:* Write code that explains itself. Don't explain with comments.
*   *Data validation:* Validate data on the route handlers.
*   *Entities:* Use dataclass entities.

# Design Patterns
*   *SOLID Principles:* All code must adhere to SOLID principles.
*   *Dependency Injection (Non-Negotiable):* The core domain logic must never directly import database drivers or external frameworks. 
*   *Repository Pattern:* Use abstract inheritance to define data access interfaces. Inject these interfaces into the use cases to ensure the code is modular and database-agnostic.

## Project-specific Architectural decisions
*   *Stateful Data Management:* Workout session data must be stored locally, *client* in-memory while the session is active. The data must be flushed to the database, into the staging are every time a set is completed.
*   *Remote staging area:* There should be a workout session database, that stores the current workout session data remotely, every time a set is completed. The idea is that it can help recover data, if the system crashes, it helps manage drifting workout sessions from workout templates, and it handles well the typo edge case.  There should be a TTL regarding the time the staging area should live
*   *Permanent data repository*: After a workout session is marked with complete, all the remote staging area data should be flushed to the permanent database.
*   *Stateless Rest Timer:* The rest timer is defined strictly as the time elapsed between a set's completion and the next set's start, regardless of whether the exercise changes. The backend does not run active timers; it only calculates the delta between timestamps.

# Images 
- **Exercise images:** Write placeholders only, and code to be able to insert the image when it is there, don't generate or search for any image
- **SVG Muscle Impact image:** This class of image can be done, as it is SVG only.
## Expected folder structure
projetoacad_rapido/
├ ── │
├── .agents/  # Agent specs
│── src/
   ├── app/            # Next.js Pages and UI Layouts (Frontend entry points)
   │   └── api/        # Next.js Route Handlers (Backend REST API endpoints)
    |── use_cases/  # Where all the domain logic should reside
    |── infrastructure/ # Database connection, ORM schemas, and Repository
    ├── domain/         # Core Entities, Value Objects, and Repository Interfaces (No external imports allowed)

│── databases/
    |── .db # The database, if it is local
│── components/ (UI)
    |── ... # All the elements that are part of the "frontend"
    │── exercises/ # All the exercise images
├── tests/ # Where the tests reside 


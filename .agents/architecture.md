## Practises
# Code Practices
*   *TDD:* Write tests that check if the expected functionality works, before writing the code itself. Afterwards, of course, code should be checked
*   *Clean code:* Write code that explains itself. Don't explain with comments.
*   *Data validation:* Validate data on the route handlers.
*   *Entities:* Use "dataclass entities".

# Design Patterns
*   *SOLID Principles:* All code must adhere to SOLID principles.
*   *Dependency Injection (Non-Negotiable):* The core domain logic must never directly import database drivers or external frameworks. 
*   *Repository Pattern:* Use "abstract inheritance" to define data access interfaces. Inject these interfaces into the use cases to ensure the code is modular and database-agnostic.
*   *Extendability*: Make the code easy to change in terms of dependencies. If I want to change the database technology, it should be easy and be direct via configuration/environment files. This also points to the ORM use. 
## Expected functions, classes and interfaces

# Use cases
*    `login`: Recieves, as parameter, the user data, and returns the user token.
*    `register`: Recieves, as parameter, the user data, registers the account if the user data is unique, and returns the user token also.
*    `delete_user`: Recieves, as parameter, the user data, deletes the account if user exists (and all the data on the workout history database).
*    `start_workout`: Recieves, as parameter, the user and the workout template, and instantiates a workout session in the staging database with a sliding TTL.
*    `get_active_workout`: Recieves the user and returns the current active (non-expired) staging workout session if one exists, allowing session recovery on reload/crash.
*   `progress_workout`: Updates an ongoing workout. Recieves, as parameter, the user, the set completion data (including `startedAt` and `completedAt` timestamps), calculates `executionDuration` and `restTime`, refreshes the TTL, and writes it into the staging area.
*   `fix_workouts`: Recieves, as parameter, the user, and a whole workout. Every staging area set related to the user should be substituted by the new whole workout.
*   `finish_workout`: Finishes an ongoing workout, recieves user data as parameter, matches or creates the global workout template and user-template link for the performed exercises, excludes warmup sets, and flushes the staging area data corresponding to the user to the permanent workout data repository.
*   `register_workout`: Registers a global workout template if not exists already, links it to the user with their custom template name in `user_workout_templates`, and retrieves the set of exercises of it.
*   `list_user_workout_templates`: Recieves the user and returns all workout templates linked to that user with their custom names and exercise lists.
*   `list_exercises`: Returns the seeded catalog of exercises from the exercise repository.
*   `get_exercise_image`: Recieves an exercise identifier, and returns the placeholder image path/data.
*   `retrieve_workout_historical_data`: Recieves, as parameter, the user and an optional workout template identifier, and returns the user's completed workout sessions (excluding warmup sets), ordered by date.
*   `retrieve_exercise_historical_data`: Recieves, as parameter, the user and an exercise identifier, and returns the user's historical set/session progression data for that exercise across workouts (excluding warmup sets), ordered by date.
# Domain
*   `set data`: Exercise identifier, weight (VO), repetitions (VO), rest time (VO), warmup flag (VO), and execution duration
*   `exercise`: Exercise identifier and name
*   `user data`: User ID (UUID), user name, and *hashed* password
*   `workout template`: template identifier and list of exercises (id's)
*   `user workout template`: user identifier, workout template identifier, and the custom template name given by that user
*   `workout`: list of set datas and a workout template identifier

# Database Structure
*   *Remote staging area:* There should be a workout session database, that stores the current workout session data remotely, every time a set is completed. The idea is that it can help recover data, if the system crashes, it helps manage drifting workout sessions from workout templates, and it handles well the typo edge case. The basic structure can be the workout template id, the set data (weight, repetitions, rest) an user identification and a TTL, to exclude the data if the workout hasn't finished for too long.

*   *Workout Template Repository*: Uses two tables: one global table that maps a workout template ID to its set of exercises, and a second table (`user_workout_templates`) that maps a user ID to a workout template ID along with the custom name given to that template by each user.
*   *Exercise Repository*: A repository that stores the exercises

*   *Permanent workout data repository*: After a workout session is marked with complete, all the remote staging area data should be flushed to the permanent database. The structure could be the token (user identificator), workout template ID, workout information (all sets), and current datetime.

# Frontend 
Do the frontend taking inspiration from mobile development, imitating the widgets logic. Use multi-tabs for each functioning, and design it as it is being used as a mobile system.
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
├── public/
│   └── exercises/      # Static exercise images (served natively by Next.js)
    └── UI/ # UI elements.
├── tests/ # Where the tests reside 



## Project-specific Architectural decisions
*   *Stateful Data Management:* Workout session data must be stored locally, *client* in-memory while the session is active. The data must be flushed to the database, into the staging are every time a set is completed.
*   *Stateless Rest Timer:* The rest timer is defined strictly as the time elapsed between a set's completion and the next set's start, regardless of whether the exercise changes. The backend does not run active timers; it only calculates the delta between timestamps.
*   *Authentication:* Create a basic authentication functionality, with tokens and cookies to identify if the person is logged in, only to identify each person on the databases, using JWT.
*   *User token:* Each user is assigned a stable UUID (`userId`) at registration which acts as the foreign key in all databases. On `login`/`register`, a signed JWT containing `{ sub: userId, username }` is returned and stored in an `httpOnly` cookie.
# Images 
- **Exercise images:** The `Exercise` entity has no `imagePath` attribute. Getting the image is done by the client using an exercise ID referenced storage (e.g. `/exercises/${id}.svg`). Placeholders only, don't generate or search for any image.

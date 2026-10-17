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

## Expected functions, classes and interfaces

# Use cases
*    `login`: Recieves, as parameter, the user data, and returns the user token.
*    `register`: Recieves, as parameter, the user data, registers the account if the user data is unique, and returns the user token also.
*    `delete_user`: Recieves, as parameter, the user data, deletes the account if user exists (and all the data on the workout history database).
*    `start_workout`: Recieves, as parameter, the user and the workout template, and instantiates a workout session in the staging database. This "instantiation" can be simply a placeholder storing a TTL, so that the workout session can be cleaned 
*   `progress_workout`: Updates an ongoing workout. Recieves, as parameter, the user, the set completion data, and writes it into the staging area.
*   `fix_workouts`: Recieves, as parameter, the user, and a whole workout. Every staging area 
*   `finish_workout`: Finishes an ongoing workout, recieves user data as parameter and flushes the staging area data corresponding to the user to the workout data repository.
*   `register_workout`: Registers a workout template if not exists already. Registers it in the workout template database, and retrieves the set of exercises of it.
*   `get_exercise_image`: Recieves an exercise identifier, and returns the image.
*   `retrieve_workout_historical_data`: Recieves, as parameter, the user and the workout template identifier, and returns the all the workout data corresponding to the user, ordered by date.
# Api
*   Create API's corresponding to every Use Case
# Domain
*   `set data`: Weight, repetitions, rest time, and exercise identifier
*   `exercise`: Exercise identifier and name
*   `user data`: user name and *hashed* password
*   `workout template`: list of exercises (id's)
*   `workout`: list of set datas and a workout template identifier

# Database Structure
*   *Remote staging area:* There should be a workout session database, that stores the current workout session data remotely, every time a set is completed. The idea is that it can help recover data, if the system crashes, it helps manage drifting workout sessions from workout templates, and it handles well the typo edge case. The basic structure can be the workout template id, the set data (weight, repetitions, rest) an user identification and a TTL, to exclude the data if the workout hasn't finished for too long.

*   *Workout Template Repository*: A repository that maps a workout template ID to a set of exercises.
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
│── components/ (UI)
    |── ... # All the elements that are part of the "frontend"
    │── exercises/ # All the exercise images
├── tests/ # Where the tests reside 



## Project-specific Architectural decisions
*   *Stateful Data Management:* Workout session data must be stored locally, *client* in-memory while the session is active. The data must be flushed to the database, into the staging are every time a set is completed.
*   *Stateless Rest Timer:* The rest timer is defined strictly as the time elapsed between a set's completion and the next set's start, regardless of whether the exercise changes. The backend does not run active timers; it only calculates the delta between timestamps.
*   *Authentication:* Create a basic authentication functionality, with tokens and cookies to identify if the person is logged in, only to identify each person on the databases.
*   *User token:* To be defined, is what identifies an user in the databases.
# Images 
- **Exercise images:** Write placeholders only, and code to be able to insert the image when it is there, don't generate or search for any image

## Project Overview
    The project consists on a Gym Assistant, aimed at structuring personal gym development easily. 

# domain entities and value objects (VO)

-   *Exercise*: smallest training instance
-   *Sets*: the amount of times an *exercise* is repeated, numerical
-   *Weight*: foundamental *exercise* attribute, numerical (VO)
-   *Repetitions*: foundamental *exercise* attribute, numerical (VO)
-   *Rest time*: time between *sets*, numerical (VO)
-   *Warmup*: if a set is a warmup. (VO)
-   *Muscle Impact*: the amount of stress into the muscle group.
-   *Workout template*: a plan, consisting on *exercises* and *sets*
-   *Workout session*: the instance of a workout, with exercises, each with an amount of *sets* done, and on each time of those *sets*, the *weight* and *repetition*. Between two sets, independently of the exercise, there will be a *rest time*


# Base workout flow
-   The user register *workout templates*
-   The user starts a *workout session*
-   The user, within a workout session, *starts* an exercise, and *finishes* it.
- - After finishing, the user registers the *weight* and *repetitions*
- - The app should automatically register the time spent during the exercise(start time- end time), and start a timer until the next set execution, which will be the *rest time*.
-   The user can choose the order of *exercises* done, and the amount of *sets* done for each *exercise*. He may also execute two *exercises* paralelly.
-   The user ends a *workout session*, and undone exercises are count as not done.
# Workout edge case: changing plans
- The user is in an active workout session
- The user does an exercise that is not in the original workout template, because the equipment he should use is already in use
- The app should allow it without issues
- At the end of the session, the app should then check if there is already such workout template registered (with that given exercises done), and adjust the workout to match that template. If there isn't, it should create a new workout template and match the workout session to it.
# Workout edge case: typo
- The user is in an active workout session
- The user edits the weight or reps of an already-logged Set.
- The backend updates the in-memory cache for that specific Set.
- Sets can only be edited while the session is active. Once the session is completed and flushed to the database, the history is immutable.
# Base record tracking flow

-   An user can track development of *weight*, *repetitions*, *rest time*, *sets* done for each *exercise* through *workout sessions*.
-   The sets marked with warmup should not be counted for those statistics
-   An user can track the *impact* over time (daily, weekly, monthly) on each *muscle group*, through workout sessions. The *impact* will be calculated using the *weight* and *sets* for an exercise. You can improve the base formula, but it goes like Impact (Volume) = Sets × Repetitions × Weight × Exercise_Muscle_Multiplier (TBD). You can search yourself for what is the multiplier for each exercise.

    QoL additions for the app.
-   Every *exercise* has its own image representation, showing the targeted muscle groups, and how much they are targeted.
-   Every workout template represents the expected muscle groups targeted

## Technical Execution Rules
Do not begin generating code based purely on this overview. To understand how to implement these domain rules, you MUST read and strictly adhere to the constraints defined in the following specification files:
1. `.agents/architecture.md` (for folder structure, Clean Architecture boundaries, and dependency injection rules)
2. `.agents/stack.md` (for the specific implementation details)
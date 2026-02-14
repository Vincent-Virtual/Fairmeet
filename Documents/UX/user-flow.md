# FairMeet User Flow (Demo)

## Goal

FairMeet helps a small group pick a meetup location and activity fairly. It balances **travel distance fairness** (average and worst-case distance) with **preference matching** (activity type, budget, indoor/outdoor), and shows explanations for each recommended option.

Basic Flow, could change and update anytime.

## Primary Flow A: Create Meetup -> Invite -> Get Recommendations

1. **Landing Page**

   User sees two main actions: **Create Meetup** and **Join Meetup**.

2. **Create Meetup**

   Creator enters basic meetup settings:

   ​	· Meetup name (optional)

   ​	· Activity type (required, e.g., coffee / food / study)

   ​	· Budget level (optional)

   ​	· Indoor/Outdoor (optional)

   ​	· Candidate source: **Default venues from local JSON dataset** (default)

   ​	· User clicks **Create**.

3. **Event Created**

   System generates an **Event Code** (and/or share link).

   Creator shares the Event Code/link with participants.

4. **Participants Join and Submit Inputs**

   Each participant opens **Join Meetup**.

   Enters:

   ​	· Event Code (required)

   ​	· Name (optional)

   ​	· Location (required; address/zip or provided location input)

   ​	· Preferences (optional, depending on event settings)

   ​	· Participant clicks **Submit**.

5. **Generate Recommendations**

   Once enough participant submissions exist, the system evaluates candidate venues:

   ​	· Computes **average distance** and **maximum distance** (worst case) across participants

   ​	· Computes **preference matching score** (tags/constraints satisfaction)

   ​	· System produces a **ranked list** of candidate venues.

6. **Results Page**

   User sees:

   ​	· Map visualization of recommended venues

   ​	· Ranked list (Top 3–5)

   ​	· A short “Why selected” explanation per venue (fairness + matched preferences)

   ​	· User may click **Recalculate** (if allowed) or **Share** results.

## Primary Flow B: Join Meetup (Participant) -> Wait -> View Results

1. Participant selects **Join Meetup** from Landing.
2. Participant enters **Event Code** and submits **Location and Preferences**.
3. If the event is not ready (e.g., not enough participants), participant sees a **Waiting** state.
4. When recommendations are available, participant opens **Results** and views the ranked list and explanations.

## Validation and Error Flows

1. **Invalid Event Code**

​	System shows an error message (e.g., “Event code not found”) and prevents submission.

2. **Missing or Invalid Location**

​	System highlights the location field and asks the user to correct it.

3. **Not Enough Participants**

​	Results page shows an empty/waiting state (e.g., “Waiting for more participants to join”).

## Outputs Needed from Backend (for UX clarity)

For the Results page, the backend planning return for each recommended venue:

- Venue name + coordinates
- Ranked score (or ordering)
- Average distance and maximum distance
- Matched preference tags / satisfied constraints
- Short explanation text (human-readable)
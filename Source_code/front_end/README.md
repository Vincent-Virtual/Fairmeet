# FairMeet Frontend

This folder contains the React frontend for FairMeet.
The frontend is built using Vite and served by the Flask backend.

---

# Build the frontend

From inside the `front_end` folder:

```
npm install
npm run build
```

This generates the production build in:

```
front_end/dist/
```

---

# Run the application

After building, start the backend server:

```
python3 ../back_end/app.py
```

Then open in browser:

```
http://127.0.0.1:5001
```

Flask will serve the built React frontend and handle API routes.

---

# When to rebuild

Run `npm run build` again whenever you modify:

* JSX files
* CSS
* routing
* map display
* API fetch logic

You do **not** need to rebuild when only modifying:

* `app.py`
* backend logic
* meetup calculation
* geocoding functions

---

# Routes

The frontend supports direct navigation to:

```
/event-created/:eventCode
/join/:eventCode
/results/:eventCode
```

These are handled by React Router, while Flask serves `index.html` as fallback.

---

# Summary

Build:

```
npm run build
```

Run:

```
python3 ../back_end/app.py
```

Open:

```
http://127.0.0.1:5001
```

# Faculty authentication and MongoDB (dedicated **faculty database**)

## Overview

- **Students** use **`studymate_db`** for the mirrored `users` collection (alongside `study_materials`, etc.).
- **Faculty** use a **separate MongoDB database** on the **same Atlas cluster**:
  - **Database name:** `studymate_faculty_db` (default; override with `MONGODB_FACULTY_DB_NAME` in `.env`)
  - **Collection name:** `faculty` (default; override with `MONGODB_FACULTY_COLLECTION`)

Faculty **sign-in** and **sign-up** read/write only this database’s faculty collection. Django still stores a `User` with `role=faculty` for JWT and permissions.

### What you see in MongoDB Atlas

| Location | Purpose |
|----------|---------|
| **Cluster0 → `studymate_db` → `users`** | Student registration mirror (`role: "student"`, `django_user_id`, …). |
| **Cluster0 → `studymate_faculty_db` → `faculty`** | **Source of truth for faculty** email + password hash + profile for login/signup. |

After the first faculty signup or `create_admin`, Atlas will show **`studymate_faculty_db`** with collection **`faculty`**.

## Environment variables (optional)

```env
# Same URI as students; database name in URI path can stay studymate_db — code selects faculty DB by name.
MONGODB_URI=mongodb+srv://...

MONGODB_FACULTY_DB_NAME=studymate_faculty_db
MONGODB_FACULTY_COLLECTION=faculty
```

## Document shape (`studymate_faculty_db.faculty`)

| Field        | Type     | Description |
|-------------|----------|-------------|
| `email`     | string   | **Lowercase** email; login id. |
| `password`  | string   | Django-style hash (`make_password`). |
| `username`  | string   | Optional. |
| `first_name`| string   | Optional. |
| `last_name` | string   | Optional. |
| `created_at`| datetime | First insert. |
| `updated_at`| datetime | Updates. |

## Migrating old faculty rows

If faculty were previously stored under **`studymate_db.faculty`**, run once:

```bash
python manage.py migrate_faculty_to_faculty_db
```

This copies documents into **`studymate_faculty_db.faculty`**.

## How to add faculty

1. **Faculty sign up** (`/signup/faculty`) → `POST /api/auth/register/faculty/`
2. **`python manage.py create_admin`** — creates Django user + Mongo faculty doc
3. **`upsert_faculty_document(...)`** in code

## API reference

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register/faculty/` | Creates Django `User` + document in **`studymate_faculty_db.faculty`**. |
| `POST /api/auth/faculty/login/` | Validates against **`studymate_faculty_db.faculty`**, then issues JWT. |
| `POST /api/auth/student/login/` | Students only (`role=student`). |

## Client routes

- `/login/faculty`, `/signup/faculty` — faculty flows.  
- `/login/student`, `/signup/student` — student flows.

## Mock Data Seed Script

The `seed-mock-data.ts` script populates the `public.users` and `public.applications` tables with exhaustive mock combinations so the recruitment UI has data to work with. It **wipes existing rows** in `reviews`, `fileuploads`, `applications`, and `users` before inserting fresh data, so only run it against disposable/local databases.

### 1. Configure Your Personal User (Optional but requested)

If you want the seed data to include your own contact information, edit `apps/backend/scripts/seed.config.json`:

```json
{
  "personalUser": {
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "status": "Admin"
  }
}
```

- Only `firstName`, `lastName`, and `email` are required.  
- `status` is optional (defaults to `Admin` if omitted).  
- Team, role, profile picture, GitHub, and LinkedIn fields are intentionally left blank for every seed user.  
- The script always creates 3 admins, 10 recruiters, and 50 applicants; your personal user is added on top of those counts.  
- Remove the `personalUser` block if you do not want an extra record.

### 2. Ensure Database Environment Variables

From the repo root, make sure these variables are exported (or defined in `apps/backend/.env`, which the script auto-loads):

- `NX_DB_HOST`
- `NX_DB_USERNAME`
- `NX_DB_PASSWORD`
- `NX_DB_DATABASE` (defaults to `c4c-ops` if missing)

### 3. Run the Seed

```bash
yarn seed:mock-data
```

This command uses `ts-node` with the backend tsconfig, connects via TypeORM, truncates dependent tables, and inserts:

- A deterministic set of 3 admins, 10 recruiters, and 50 applicants built from predefined name pairs (with team/role/social columns left null), plus your optional personal user
- One Spring 2025 application per applicant (50 total) with stage, progress, review status, and position cycling through the enum values for variety

### 4. Verify (Optional)

Use any SQL client to inspect `public.users` and `public.applications`, or hit the existing API endpoints to confirm the data looks correct. If you need to reseed, rerun the command—it will clear and repopulate the tables each time.

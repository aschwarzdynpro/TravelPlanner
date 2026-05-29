<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TravelPlanner – project notes

Collaborative trip/event planner. **Next.js 16** (App Router, Server Actions) +
**TypeScript** + **Tailwind v4** + **Supabase** (Postgres, Auth, RLS).

## Layout
- `src/app/(app)/` – authenticated area (trips list, trip detail, member area). Guarded by `src/app/(app)/layout.tsx`.
- `src/app/login/`, `src/app/auth/` – auth (email/password) + callback + signout.
- `src/app/follow/[token]/` – public read-only "Follow Me" view (no auth).
- `src/lib/supabase/` – browser/server/proxy Supabase clients.
- `src/lib/database.types.ts` – generated DB types (keep `Relationships` arrays so embedded selects type-check).
- `src/components/trip/` – the trip workspace and its tab sections.
- `src/proxy.ts` – Next.js 16 proxy (formerly middleware) that refreshes the session and gates routes.
- `supabase/migrations/` – source of truth for the DB schema/RLS.

## Conventions
- Mutations go through **Server Actions** (`actions.ts` files) using the server Supabase client; they `revalidatePath` the affected route.
- Forms are plain `<form action={serverAction}>`; interactive bits are small Client Components.
- All access control is enforced by **RLS**, not in app code.

## RLS gotcha (important)
The `trips` SELECT/UPDATE policies reference the row's own columns
(`created_by`, `is_public`) directly and use `is_trip_member` / `is_trip_editor`
helpers that query **only** `trip_members`. Do **not** make the `trips` policy
re-query `trips` (e.g. via `can_view_trip`): during `INSERT ... RETURNING`
(which `.select()` triggers) the statement snapshot can't see the new row, so the
insert fails with a 42501. Child tables may use `can_view_trip`/`can_edit_trip`
since `trips` is already committed when children are written.

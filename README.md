# Three in a Row

A responsive Tic Tac Toe prototype with Supabase email/password authentication and an admin-only player directory.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com/) and wait for its database to be ready.
2. In **Project Settings → API** (or **API Keys**), copy the project URL and the **publishable/anon** key.
3. Copy `.env.example` to `.env.local` and replace the placeholders:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```

   Never put a `service_role` or secret key in a `VITE_` variable or in browser code.

## 2. Create the profile table and security rules

1. In the Supabase dashboard, open **SQL Editor**.
2. Open `supabase/setup.sql` in this project, copy its contents into a new SQL query, and run it.
3. The script creates a profile row for new accounts, enables row-level security, and limits the directory query to authenticated admins. Passwords remain managed by Supabase Auth and are never put in the profiles table.

## 3. Configure email authentication

In **Authentication → Providers → Email**, enable email/password sign-in. For quick local prototyping you can turn off email confirmation; otherwise users need to confirm the email before signing in. Add your local app URL (`http://localhost:5173`) to the allowed redirect/site URLs if the dashboard requests it.

## 4. Set up the admin account

1. Create your own account through the app’s sign-up screen.
2. In Supabase **Authentication → Users**, open that account’s user details and set trusted **app metadata** to include `role` with value `admin`, for example `{ "role": "admin" }`. Do not put the role in user-editable metadata.
3. Sign out and back in so the browser receives an updated auth token.
4. The signed-in admin will see **Users** in the game header. That page can display profile names, email addresses, and registration dates. Database row-level security is the actual protection; hiding the button is not relied on for security.

## Run locally

1. Install Node.js 18 or newer.
2. Run `npm install` in this folder.
3. Run `npm run dev` and open the local URL Vite prints.
4. Run `npm run build` to create a production build in `dist/`.

## Prototype notes

The app uses Supabase Auth sessions; it no longer treats browser storage as an authentication system. The player directory contains profile information only, never passwords. Keep `.env.local` private. Before a public launch, configure email confirmation, recovery/redirect URLs, abuse protections, and any required privacy notice.

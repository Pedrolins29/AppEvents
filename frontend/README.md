# AppEvents Frontend

Next.js (App Router) + TypeScript + Tailwind CSS.

```
src/
  app/
    page.tsx           Landing page
    register/page.tsx  Registration form
    login/page.tsx     Login form
    dashboard/page.tsx Protected placeholder — calls GET /api/users/me
  lib/
    apiClient.ts        fetch wrapper: attaches the access token, retries once on 401 via silent refresh
    authApi.ts          register / login / refresh / logout / getMe
    auth-context.tsx     React context holding the access token in memory (never localStorage)
  types/auth.ts          DTOs mirrored from the backend
```

The refresh token lives only in an `HttpOnly` cookie set by the backend; the access token is
kept in memory and re-minted via a silent `/api/auth/refresh` call on load.

## Setup

```
cp .env.example .env.local   # already present locally; edit NEXT_PUBLIC_API_BASE_URL if needed
npm install
npm run dev
```

App at `http://localhost:3000`. Requires the backend running at the URL configured in
`NEXT_PUBLIC_API_BASE_URL` (see [../backend/README.md](../backend/README.md)).

## Other commands

```
npm run build   # production build
npm run lint    # ESLint
```

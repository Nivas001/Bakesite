# Appwrite backend

All auth and data now run on Appwrite. Nothing else is required in code — only
configuration.

## 1. Create the project

1. Create an Appwrite project (Cloud or self-hosted).
2. In **Auth → Settings**, enable **Email/Password** and (optionally) **Google OAuth**.
3. Add your app URL as a **Web platform** (Settings → Platforms) so the browser SDK is allowed.
4. Create an **API key** (Settings → API keys) with scopes:
   `databases.read`, `databases.write`, `collections.*`, `attributes.*`,
   `indexes.*`, `documents.read`, `documents.write`, `users.read`.

## 2. Environment variables

Browser (build-time):

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<project id>
```

Server (secrets):

```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<project id>
APPWRITE_API_KEY=<server api key>
APPWRITE_DATABASE_ID=bakery
APPWRITE_ADMIN_EMAILS=nivassri183@gmail.com
```

## 3. Provision collections + seed data

```
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
APPWRITE_DATABASE_ID=bakery bun run scripts/appwrite-setup.ts
```

This creates `profiles`, `user_roles`, `categories`, `products`, `orders`,
`order_items`, `reviews`, `blackout_dates`, `newsletter_subscribers` and
`newsletter_campaigns`, then seeds starter categories and products.

## Security model

Collections are created with **no public permissions**. Every read and write
goes through TanStack server functions that use the server API key, after the
caller's Appwrite session JWT is verified (`requireAppwriteAuth`) and, for admin
routes, after an admin role check against `user_roles`. The first sign-in from an
email listed in `APPWRITE_ADMIN_EMAILS` is granted the admin role automatically.
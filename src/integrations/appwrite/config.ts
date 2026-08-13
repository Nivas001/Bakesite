// Client-safe Appwrite configuration (no secrets).
export const APPWRITE_ENDPOINT =
  import.meta.env['VITE_APPWRITE_ENDPOINT'] ?? 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env['VITE_APPWRITE_PROJECT_ID'] ?? '';

/** Collection ids used across the app. Keep in sync with scripts/appwrite-setup.ts */
export const COLLECTIONS = {
  profiles: 'profiles',
  userRoles: 'user_roles',
  categories: 'categories',
  products: 'products',
  orders: 'orders',
  orderItems: 'order_items',
  reviews: 'reviews',
  blackoutDates: 'blackout_dates',
  newsletterSubscribers: 'newsletter_subscribers',
  newsletterCampaigns: 'newsletter_campaigns',
} as const;
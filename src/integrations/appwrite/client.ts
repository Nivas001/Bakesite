import { Account, Client, ID, OAuthProvider } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './config';

function createAppwriteClient() {
  if (!APPWRITE_PROJECT_ID) {
    throw new Error(
      'Missing VITE_APPWRITE_PROJECT_ID. Add your Appwrite endpoint and project id to the environment.',
    );
  }
  return new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

let _client: Client | undefined;
function client(): Client {
  if (!_client) _client = createAppwriteClient();
  return _client;
}

let _account: Account | undefined;
export function appwriteAccount(): Account {
  if (!_account) _account = new Account(client());
  return _account;
}

export type AppwriteUser = {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  phone?: string;
  phoneVerification?: boolean;
};

export async function getCurrentUser(): Promise<AppwriteUser | null> {
  try {
    return (await appwriteAccount().get()) as unknown as AppwriteUser;
  } catch {
    return null;
  }
}

/** Sends an email verification link using Appwrite createVerification */
export async function sendEmailVerification(url: string): Promise<void> {
  await appwriteAccount().createVerification({ url });
}

/** Confirms email verification using the userId and secret received from email link */
export async function confirmEmailVerification(userId: string, secret: string): Promise<void> {
  try {
    await appwriteAccount().updateEmailVerification({ userId, secret });
  } catch {
    await appwriteAccount().updateVerification({ userId, secret });
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await appwriteAccount().createEmailPasswordSession({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<void> {
  await appwriteAccount().create({ userId: ID.unique(), email, password, name });
  await signInWithEmail(email, password);
}

export function signInWithGoogle(success: string, failure: string): void {
  appwriteAccount().createOAuth2Token({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}

/** Creates a local authenticated session from OAuth2 token query params (userId and secret) */
export async function createSessionFromToken(userId: string, secret: string): Promise<void> {
  await appwriteAccount().createSession({ userId, secret });
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`;
  await appwriteAccount().createRecovery({ email, url });
}

export async function confirmPasswordRecovery(
  userId: string,
  secret: string,
  password: string,
): Promise<void> {
  await appwriteAccount().updateRecovery({ userId, secret, password });
}

export async function signOut(): Promise<void> {
  try {
    await appwriteAccount().deleteSession({ sessionId: 'current' });
  } catch {
    /* already signed out */
  }
}

/** Short-lived JWT used to authenticate server function calls. */
export async function createSessionJwt(): Promise<string | null> {
  try {
    const jwt = await appwriteAccount().createJWT();
    return jwt.jwt;
  } catch {
    return null;
  }
}
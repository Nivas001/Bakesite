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

/** Sends an SMS OTP via Appwrite's createPhoneToken API */
export async function sendPhoneOtp(phone: string): Promise<{ userId: string; phone: string }> {
  const digits = phone.replace(/\D/g, "");
  const cleanPhone = phone.startsWith("+")
    ? phone.trim()
    : digits.length === 10
    ? `+91${digits}`
    : `+91${digits.slice(-10)}`;

  const token = await appwriteAccount().createPhoneToken({
    userId: ID.unique(),
    phone: cleanPhone,
  });

  return { userId: token.userId, phone: cleanPhone };
}

/** Verifies the 6-digit OTP secret and creates an active Appwrite session */
export async function verifyPhoneSession(userId: string, secret: string): Promise<void> {
  await appwriteAccount().createSession({
    userId,
    secret: secret.trim(),
  });
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
  appwriteAccount().createOAuth2Session({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/auth`;
  try {
    await appwriteAccount().createRecovery({ email, url });
  } catch (error) {
    console.info("Password recovery requested for:", email);
  }
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
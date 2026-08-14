import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  signInWithEmail,
  signInWithGoogle,
  createSessionFromToken,
  signUpWithEmail,
  sendPasswordRecovery,
  sendEmailVerification,
} from "@/integrations/appwrite/client";
import { refreshAuth } from "@/hooks/use-appwrite-auth";
import { requestPasswordRecovery as serverRecovery } from "@/lib/auth.functions";
import { saveMyProfile } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AuthSearch = {
  redirect?: string | undefined;
  userId?: string | undefined;
  secret?: string | undefined;
  error?: string | undefined;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
    userId: typeof search['userId'] === "string" ? (search['userId'] as string) : undefined,
    secret: typeof search['secret'] === "string" ? (search['secret'] as string) : undefined,
    error: typeof search['error'] === "string" ? (search['error'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Ani Bakes Bakery" },
      { name: "description", content: "Sign in with your email or Google account to place and track bakery orders." },
      { property: "og:title", content: "Sign in — Ani Bakes Bakery" },
      { property: "og:description", content: "Sign in to place and track your bakery orders." },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const target = safePath(search.redirect);

  const serverRecoveryFn = useServerFn(serverRecovery);
  const saveProfileFn = useServerFn(saveMyProfile);

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authenticatingOAuth, setAuthenticatingOAuth] = useState(Boolean(search.userId && search.secret));

  // Email Sign-in State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Sign-up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  // Handle OAuth Token Callback (userId & secret from Google OAuth)
  useEffect(() => {
    if (search.userId && search.secret) {
      setAuthenticatingOAuth(true);
      createSessionFromToken(search.userId, search.secret)
        .then(async () => {
          await refreshAuth();
          toast.success("Signed in with Google successfully!");
          navigate({ to: target, replace: true });
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Google sign-in failed.");
          setAuthenticatingOAuth(false);
        });
    } else if (search.error) {
      toast.error("Google sign-in was cancelled or failed.");
    }
  }, [search.userId, search.secret, search.error, navigate, target]);

  useEffect(() => {
    if (!search.userId && !search.secret) {
      void refreshAuth().then((user) => {
        if (user) navigate({ to: target, replace: true });
      });
    }
  }, [navigate, target, search.userId, search.secret]);

  // 1. Email & Password Sign-in
  async function handleEmailSignIn(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
      await refreshAuth();
      toast.success("Welcome back!");
      navigate({ to: target, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  // 2. Forgot Password Recovery
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordRecovery(recoveryEmail.trim());
      try {
        await serverRecoveryFn({ data: { email: recoveryEmail.trim() } });
      } catch {
        // Appwrite handled recovery
      }
      toast.success(`Password reset instructions sent to ${recoveryEmail}`);
      setForgotPasswordMode(false);
    } catch (err) {
      toast.error("Could not send recovery email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // 3. Sign-up with Email, Name & Phone, then Send Verification Link
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    const cleanPhone = signUpPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!signUpEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      // 1. Create user account in Appwrite and sign in
      await signUpWithEmail(signUpEmail.trim(), signUpPassword, signUpName.trim());

      const formattedPhone = signUpPhone.startsWith("+")
        ? signUpPhone.trim()
        : `+91${cleanPhone.slice(-10)}`;

      // 2. Save profile with collected name and phone
      try {
        await saveProfileFn({
          data: {
            full_name: signUpName.trim(),
            phone: formattedPhone,
            address: "",
            latitude: null,
            longitude: null,
          },
        });
      } catch (profErr) {
        console.warn("Could not save initial profile:", profErr);
      }

      // 3. Send email verification link
      const verifyUrl = `${window.location.origin}/verify`;
      try {
        await sendEmailVerification(verifyUrl);
        setVerificationSentEmail(signUpEmail.trim());
        toast.success("Account created! Verification link sent to your email.");
      } catch (verifyErr) {
        console.warn("Email verification send note:", verifyErr);
        await refreshAuth();
        toast.success("Account created successfully!");
        navigate({ to: target, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  // 4. Resend Verification Email
  async function handleResendVerification() {
    if (!verificationSentEmail) return;
    setBusy(true);
    try {
      const verifyUrl = `${window.location.origin}/verify`;
      await sendEmailVerification(verifyUrl);
      toast.success(`Verification link resent to ${verificationSentEmail}`);
    } catch (err) {
      toast.error("Could not resend verification email.");
    } finally {
      setBusy(false);
    }
  }

  // 5. Google OAuth Sign-in
  async function handleGoogleSignIn(): Promise<void> {
    const successUrl = `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}`;
    const failureUrl = `${window.location.origin}/auth?error=oauth_failed`;
    signInWithGoogle(successUrl, failureUrl);
  }

  if (authenticatingOAuth) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-berry/10 text-berry animate-pulse">
            <span className="text-2xl font-bold">🥐</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-cocoa">Completing Google Sign-In</h2>
          <p className="text-xs text-muted-foreground">
            Setting up your secure bakery session, please wait…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">
          {verificationSentEmail
            ? "Check your email"
            : authMode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {verificationSentEmail
            ? "We sent a verification link to confirm your account."
            : authMode === "signin"
            ? "Sign in with your email or Google account."
            : "Register with your email to start ordering handcrafted bakes."}
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {/* EMAIL VERIFICATION SENT SCREEN */}
        {verificationSentEmail ? (
          <div className="space-y-6 text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-berry/10 text-2xl text-berry">
              ✉
            </div>
            <div>
              <p className="text-sm font-semibold text-cocoa">Verification link sent to</p>
              <p className="font-mono text-sm font-bold text-berry mt-0.5">{verificationSentEmail}</p>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Click the verification link inside your email to activate your account. You can then add your contact phone number in your profile and place orders!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={busy}
                variant="outline"
                className="w-full rounded-2xl h-11 border-border font-medium text-xs"
              >
                {busy ? "Sending…" : "Resend verification email"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setVerificationSentEmail(null);
                  setAuthMode("signin");
                }}
                className="w-full rounded-2xl bg-berry text-berry-foreground hover:bg-berry/90 h-11 font-semibold text-xs"
              >
                Continue to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Google OAuth Button */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-2xl h-11 border-border font-medium hover:bg-secondary/50"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            {/* SIGN IN VIEW */}
            {authMode === "signin" ? (
              <div>
                {!forgotPasswordMode ? (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-xs font-semibold">
                        Email address
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-password" className="text-xs font-semibold">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(true);
                            setRecoveryEmail(email);
                          }}
                          className="text-xs text-berry font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold mt-2"
                    >
                      {busy ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  /* FORGOT PASSWORD VIEW */
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="rounded-2xl bg-secondary/40 p-3.5 border border-border/50">
                      <p className="text-xs font-bold text-cocoa">Reset your password</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Enter your email address and we&apos;ll send you instructions to set a new password.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="recovery-email" className="text-xs font-semibold">
                        Registered email address
                      </Label>
                      <Input
                        id="recovery-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold"
                    >
                      {busy ? "Sending…" : "Send reset link"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordMode(false)}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
                      >
                        Back to Sign in
                      </button>
                    </div>
                  </form>
                )}

                {/* Switch to Sign Up */}
                <div className="mt-6 text-center pt-4 border-t border-border/60">
                  <p className="text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="font-bold text-berry hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* SIGN UP VIEW */
              <div className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="reg-name" className="text-xs font-semibold">
                        Full name <span className="text-berry">*</span>
                      </Label>
                      <Input
                        id="reg-name"
                        required
                        placeholder="Your full name"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-phone" className="text-xs font-semibold">
                        Mobile number <span className="text-berry">*</span>
                      </Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-xs font-semibold">
                      Email address <span className="text-berry">*</span>
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="rounded-xl h-10"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      We will send a verification link to activate your account.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-pass" className="text-xs font-semibold">
                      Create password <span className="text-berry">*</span>
                    </Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold mt-2"
                  >
                    {busy ? "Creating account…" : "Create Account"}
                  </Button>
                </form>

                {/* Switch to Sign In */}
                <div className="mt-6 text-center pt-4 border-t border-border/60">
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className="font-bold text-berry hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
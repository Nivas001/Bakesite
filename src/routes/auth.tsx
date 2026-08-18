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
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";

export type AuthSearch = {
  redirect?: string | undefined;
  userId?: string | undefined;
  secret?: string | undefined;
  error?: string | undefined;
  mode?: "signin" | "signup" | undefined;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
    userId: typeof search["userId"] === "string" ? (search["userId"] as string) : undefined,
    secret: typeof search["secret"] === "string" ? (search["secret"] as string) : undefined,
    error: typeof search["error"] === "string" ? (search["error"] as string) : undefined,
    mode: search["mode"] === "signup" || search["mode"] === "signin" ? search["mode"] : undefined,
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

  const [authMode, setAuthMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [authenticatingOAuth, setAuthenticatingOAuth] = useState(Boolean(search.userId && search.secret));

  // Email Sign-in State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Sign-up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  // Sync mode with search param if changed
  useEffect(() => {
    if (search.mode && (search.mode === "signin" || search.mode === "signup")) {
      setAuthMode(search.mode);
    }
  }, [search.mode]);

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
      <div className="flex min-h-[calc(100svh-8rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-2xl sm:rounded-3xl border border-border bg-card p-6 shadow-soft text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-berry/10 text-berry animate-pulse">
            <span className="text-xl font-bold">🥐</span>
          </div>
          <h2 className="font-display text-xl font-bold text-cocoa">Completing Google Sign-In</h2>
          <p className="text-xs text-muted-foreground">
            Setting up your secure bakery session, please wait…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100svh-7.5rem)] flex flex-col justify-center px-4 py-8 sm:py-12 bg-background overflow-hidden">
      
      {/* Center Section: Floating Card & Flanking Geometric Elements */}
      <div className="relative my-auto flex items-center justify-center w-full max-w-4xl mx-auto">
        
        {/* Bottom-Left Character & Geometric Pedestals (Desktop & Tablet) */}
        <div className="hidden md:flex absolute -left-2 sm:left-2 lg:left-6 bottom-0 z-10 flex-col items-start pointer-events-none select-none">
          <div className="relative">
            {/* Doodled Sparkles */}
            <div className="absolute -top-6 left-6 text-cocoa/50 font-mono text-sm select-none tracking-widest">
              \ | /
            </div>
            {/* Character with laptop on pedestal blocks */}
            <div className="relative w-36 sm:w-44 lg:w-52 h-44 sm:h-52 flex items-end">
              <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-md">
                {/* Base Step 1: White Box with rising arrow */}
                <rect x="10" y="140" width="60" height="70" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" rx="4" />
                <path d="M25 195 L55 155 M38 155 L55 155 L55 172" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" />
                
                {/* Base Step 2: Yellow Elevated Podium */}
                <rect x="70" y="110" width="70" height="100" fill="#FCE38A" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" rx="4" />
                
                {/* Baseline */}
                <line x1="0" y1="210" x2="200" y2="210" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" />

                {/* Character Sitting On Yellow Podium */}
                {/* Hair */}
                <path d="M75 35 C70 20, 95 15, 105 30 C115 35, 120 50, 110 60 C98 62, 85 55, 75 35 Z" fill="#1C1816" />
                <circle cx="70" cy="48" r="8" fill="#1C1816" />
                {/* Face & Head */}
                <circle cx="95" cy="50" r="14" fill="#FFE5D9" />
                <path d="M92 48 Q95 52 98 48" fill="none" stroke="#1C1816" strokeWidth="2" />
                {/* Patterned Top */}
                <path d="M80 65 L115 65 L125 110 L75 110 Z" fill="#1C1816" />
                {/* White accents on top */}
                <line x1="85" y1="75" x2="90" y2="70" stroke="#FFF" strokeWidth="2" />
                <line x1="100" y1="80" x2="105" y2="75" stroke="#FFF" strokeWidth="2" />
                <line x1="90" y1="95" x2="95" y2="90" stroke="#FFF" strokeWidth="2" />
                <line x1="110" y1="95" x2="115" y2="90" stroke="#FFF" strokeWidth="2" />
                {/* Laptop */}
                <path d="M125 90 L140 70 L145 92 L120 96 Z" fill="#E86033" stroke="currentColor" strokeWidth="2" className="text-cocoa" />
                <rect x="110" y="94" width="28" height="5" fill="#C54820" rx="2" />
                {/* White Legs / Trousers */}
                <path d="M85 110 L105 110 L115 160 L100 160 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" />
                <path d="M105 110 L125 110 L145 160 L130 160 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" />
                {/* Black Shoes */}
                <path d="M95 160 L110 160 L115 170 L95 170 Z" fill="#1C1816" />
                <path d="M130 160 L150 160 L155 172 L132 172 Z" fill="#1C1816" />
              </svg>
            </div>
          </div>
        </div>

        {/* Central Floating Card */}
        <div className="relative z-20 w-full max-w-md bg-white dark:bg-card rounded-[2.25rem] border border-border/80 p-6 sm:p-9 shadow-xl shadow-orange-950/5 dark:shadow-none">
          
          {/* Card Header: Stacked 2-Line Blogh Title */}
          <div className="space-y-1 mb-6">
            <h1 className="font-blogh text-3xl sm:text-4xl font-bold tracking-tight text-cocoa leading-tight uppercase">
              {verificationSentEmail ? (
                <>
                  <div>Check</div>
                  <div className="text-[#E86033]">Your Email</div>
                </>
              ) : authMode === "signin" ? (
                <>
                  <div>Lets</div>
                  <div className="text-[#E86033]">Taste Fresh Bakes</div>
                </>
              ) : (
                <>
                  <div>Lets</div>
                  <div className="text-[#E86033]">Start Ordering</div>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {verificationSentEmail
                ? "We sent an activation link to your inbox."
                : "Please login or sign up to continue"}
            </p>
          </div>

          {/* EMAIL VERIFICATION SENT SCREEN */}
          {verificationSentEmail ? (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-[#E86033]">
                ✉
              </div>
              <div>
                <p className="text-xs font-semibold text-cocoa">Verification link sent to</p>
                <p className="font-mono text-xs font-bold text-[#E86033] mt-0.5">{verificationSentEmail}</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Click the link inside your email to activate your account and access member bakes!
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
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
                  className="w-full rounded-2xl bg-[#E86033] hover:bg-[#D44E23] text-white h-11 font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Continue to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* SIGN IN VIEW */}
              {authMode === "signin" ? (
                <div>
                  {!forgotPasswordMode ? (
                    <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                      {/* Email Input */}
                      <div className="space-y-1">
                        <Label htmlFor="login-email" className="sr-only">
                          Your Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="login-email"
                            type="email"
                            required
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-11 pr-4 text-sm font-medium focus-visible:ring-[#E86033]"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1">
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="login-password"
                            type={showSignInPassword ? "text" : "password"}
                            required
                            placeholder="Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-11 pr-11 text-sm font-medium focus-visible:ring-[#E86033]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                            aria-label={showSignInPassword ? "Hide password" : "Show password"}
                          >
                            {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotPasswordMode(true);
                              setRecoveryEmail(email);
                            }}
                            className="text-xs text-muted-foreground hover:text-[#E86033] font-medium transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>

                      {/* Primary Sign In CTA */}
                      <Button
                        type="submit"
                        disabled={busy}
                        className="w-full bg-[#E86033] hover:bg-[#D44E23] text-white rounded-2xl h-12 font-bold text-base shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer mt-2"
                      >
                        {busy ? "Signing In…" : "Sign In"}
                      </Button>

                      {/* Google OAuth Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl h-12 border-border/80 font-semibold text-sm hover:bg-secondary/50 cursor-pointer bg-white dark:bg-card"
                      >
                        <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
                        <span>Google</span>
                      </Button>
                    </form>
                  ) : (
                    /* FORGOT PASSWORD VIEW */
                    <form onSubmit={handleForgotPassword} className="space-y-3.5">
                      <div className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60">
                        <p className="text-xs font-bold text-cocoa">Reset your password</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enter your registered email and we&apos;ll send recovery instructions.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="recovery-email" className="sr-only">
                          Registered email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="recovery-email"
                            type="email"
                            required
                            placeholder="Your Registered Email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            className="h-12 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-11 pr-4 text-sm font-medium focus-visible:ring-[#E86033]"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={busy}
                        className="w-full bg-[#E86033] hover:bg-[#D44E23] text-white rounded-2xl h-12 font-bold text-base shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        {busy ? "Sending…" : "Send Reset Link"}
                      </Button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setForgotPasswordMode(false)}
                          className="text-xs text-muted-foreground hover:text-foreground font-medium underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Switch to Sign Up */}
                  <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="font-bold text-[#E86033] hover:underline cursor-pointer ml-1"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                /* SIGN UP VIEW */
                <div>
                  <form onSubmit={handleSignUp} className="space-y-3">
                    {/* Full Name & Phone in 2 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reg-name"
                          required
                          placeholder="Your Name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className="h-11 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-10 pr-3 text-xs sm:text-sm font-medium focus-visible:ring-[#E86033]"
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          required
                          placeholder="10-digit Phone"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          className="h-11 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-10 pr-3 text-xs sm:text-sm font-medium focus-visible:ring-[#E86033]"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="Your Email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="h-12 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-11 pr-4 text-sm font-medium focus-visible:ring-[#E86033]"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reg-pass"
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Create Password (6+ chars)"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="h-12 rounded-2xl bg-[#F6F4EF] dark:bg-secondary/40 border-border/70 pl-11 pr-11 text-sm font-medium focus-visible:ring-[#E86033]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                      >
                        {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {/* Primary Sign Up CTA */}
                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-[#E86033] hover:bg-[#D44E23] text-white rounded-2xl h-12 font-bold text-base shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer mt-1"
                    >
                      {busy ? "Creating Account…" : "Sign Up"}
                    </Button>

                    {/* Google OAuth Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl h-12 border-border/80 font-semibold text-sm hover:bg-secondary/50 cursor-pointer bg-white dark:bg-card"
                    >
                      <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
                      <span>Google</span>
                    </Button>
                  </form>

                  {/* Switch to Sign In */}
                  <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
                    Already Have An Account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className="font-bold text-[#E86033] hover:underline cursor-pointer ml-1"
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom-Right Geometric Pedestals & Doodles (Desktop & Tablet) */}
        <div className="hidden md:flex absolute -right-2 sm:right-2 lg:right-6 bottom-0 z-10 flex-col items-end pointer-events-none select-none">
          <svg viewBox="0 0 180 180" className="w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 drop-shadow-md">
            {/* Rising Steam Puff / Doodles */}
            <path
              d="M120 40 C110 25, 135 15, 145 30 C155 40, 150 55, 135 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="text-[#E86033]"
            />
            <path d="M100 65 Q115 50 130 65" fill="none" stroke="currentColor" strokeWidth="2" className="text-cocoa" />
            
            {/* White Step Box */}
            <rect x="20" y="85" width="60" height="95" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" rx="4" />
            
            {/* Yellow Tall Step Box */}
            <rect x="80" y="45" width="70" height="135" fill="#FCE38A" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" rx="4" />
            
            {/* Baseline Connection */}
            <line x1="0" y1="180" x2="180" y2="180" stroke="currentColor" strokeWidth="2.5" className="text-cocoa" />
          </svg>
        </div>
      </div>

      {/* Subtle Bottom Footer Note */}
      <div className="text-center text-[11px] text-muted-foreground/80 z-10">
        Handcrafted artisanal sourdough & patisserie &bull; Pondicherry, India
      </div>
    </div>
  );
}
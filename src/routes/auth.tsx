import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  sendPasswordRecovery,
  sendPhoneOtp,
  verifyPhoneSession,
} from "@/integrations/appwrite/client";
import { refreshAuth } from "@/hooks/use-appwrite-auth";
import { requestPhoneOtp, verifyPhoneOtpEndpoint, requestPasswordRecovery as serverRecovery } from "@/lib/auth.functions";
import { saveMyProfile } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Sweet Crumb Bakery" },
      { name: "description", content: "Sign in with your phone or email to place and track your bakery orders." },
      { property: "og:title", content: "Sign in — Sweet Crumb Bakery" },
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

  const requestOtpFn = useServerFn(requestPhoneOtp);
  const verifyOtpFn = useServerFn(verifyPhoneOtpEndpoint);
  const saveProfileFn = useServerFn(saveMyProfile);
  const serverRecoveryFn = useServerFn(serverRecovery);

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signInMethod, setSignInMethod] = useState<"phone" | "email">("phone");

  // Phone OTP Sign-in State
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [appwriteUserId, setAppwriteUserId] = useState<string | null>(null);

  // Email Sign-in State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Sign-up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpOtp, setSignUpOtp] = useState("");
  const [signUpOtpSent, setSignUpOtpSent] = useState(false);
  const [signUpAppwriteUserId, setSignUpAppwriteUserId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshAuth().then((user) => {
      if (user) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  // 1. Phone OTP Request (Login via Appwrite createPhoneToken)
  async function handleSendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      // First attempt native Appwrite createPhoneToken
      try {
        const appwriteRes = await sendPhoneOtp(phone);
        setAppwriteUserId(appwriteRes.userId);
        setPhoneOtpSent(true);
        toast.success(`6-digit OTP sent to ${appwriteRes.phone}`);
      } catch (appwriteErr) {
        console.warn("Appwrite Phone Token SMS gateway fallback:", appwriteErr);
        // Fallback to server simulated OTP if SMS gateway is not configured
        const res = await requestOtpFn({ data: { phone } });
        setPhoneOtpSent(true);
        setAppwriteUserId(null);
        if (res.devCode) {
          toast.success(`OTP sent to ${res.phone}! (Test Code: ${res.devCode})`);
        } else {
          toast.success(`6-digit OTP sent to ${res.phone}`);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  }

  // 2. Phone OTP Verification (Login via Appwrite createSession)
  async function handleVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOtp.trim() || phoneOtp.length < 4) {
      toast.error("Please enter the 6-digit OTP sent to your phone.");
      return;
    }
    setBusy(true);
    try {
      if (appwriteUserId) {
        // Appwrite native phone session creation
        await verifyPhoneSession(appwriteUserId, phoneOtp);
        const user = await refreshAuth();
        if (user) {
          try {
            await saveProfileFn({
              data: {
                full_name: user.name || "Bakery Customer",
                phone: phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`,
                address: "",
                latitude: null,
                longitude: null,
              },
            });
          } catch {
            // Profile exists or already saved
          }
        }
        toast.success("Signed in successfully via Appwrite!");
        navigate({ to: target, replace: true });
        return;
      }

      // Fallback verification
      const res = await verifyOtpFn({ data: { phone, code: phoneOtp } });
      if (res.ok) {
        const autoEmail = `user.${res.phone.replace(/\D/g, "")}@sweetcrumb.in`;
        const autoPass = `Sweet#Crumb${res.phone.slice(-6)}!`;

        try {
          await signInWithEmail(autoEmail, autoPass);
        } catch {
          try {
            await signUpWithEmail(autoEmail, autoPass, res.profile?.fullName || "Bakery Customer");
            await saveProfileFn({
              data: {
                full_name: res.profile?.fullName || "Bakery Customer",
                phone: res.phone,
                address: res.profile?.address || "",
                latitude: null,
                longitude: null,
              },
            });
          } catch {
            // Already created
          }
        }
        await refreshAuth();
        toast.success("Signed in successfully!");
        navigate({ to: target, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired OTP code.");
    } finally {
      setBusy(false);
    }
  }

  // 3. Email & Password Sign-in
  async function handleEmailSignIn(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      await refreshAuth();
      toast.success("Welcome back!");
      navigate({ to: target, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  // 4. Forgot Password Recovery
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordRecovery(recoveryEmail);
      await serverRecoveryFn({ data: { email: recoveryEmail } });
      toast.success(`Password reset instructions sent to ${recoveryEmail}`);
      setForgotPasswordMode(false);
    } catch (err) {
      toast.error("Could not send recovery email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // 5. Sign-up: Send Phone Verification OTP
  async function handleSignUpSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast.error("Please enter your full name.");
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
    if (!signUpPhone.trim() || signUpPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setBusy(true);
    try {
      try {
        const appRes = await sendPhoneOtp(signUpPhone);
        setSignUpAppwriteUserId(appRes.userId);
        setSignUpOtpSent(true);
        toast.success(`6-digit verification code sent to ${appRes.phone}`);
      } catch (appErr) {
        console.warn("Appwrite signup OTP fallback:", appErr);
        const res = await requestOtpFn({
          data: {
            phone: signUpPhone,
            name: signUpName,
            email: signUpEmail,
          },
        });
        setSignUpOtpSent(true);
        setSignUpAppwriteUserId(null);
        if (res.devCode) {
          toast.success(`Verification code sent to ${res.phone}! (Test Code: ${res.devCode})`);
        } else {
          toast.success(`6-digit verification code sent to ${res.phone}`);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send verification code.");
    } finally {
      setBusy(false);
    }
  }

  // 6. Sign-up: Verify OTP & Create Verified Account
  async function handleSignUpConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!signUpOtp.trim() || signUpOtp.length < 4) {
      toast.error("Please enter the 6-digit OTP sent to your phone.");
      return;
    }
    setBusy(true);
    try {
      if (signUpAppwriteUserId) {
        await verifyPhoneSession(signUpAppwriteUserId, signUpOtp);
      } else {
        const verifyRes = await verifyOtpFn({ data: { phone: signUpPhone, code: signUpOtp } });
        if (!verifyRes.ok) throw new Error("Invalid verification code");
      }

      // Create / link account
      try {
        await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      } catch {
        await signInWithEmail(signUpEmail, signUpPassword);
      }

      const formattedPhone = signUpPhone.startsWith("+")
        ? signUpPhone
        : `+91${signUpPhone.replace(/\D/g, "").slice(-10)}`;

      await saveProfileFn({
        data: {
          full_name: signUpName,
          phone: formattedPhone,
          address: "",
          latitude: null,
          longitude: null,
        },
      });

      await refreshAuth();
      toast.success("Account created and phone number verified!");
      navigate({ to: target, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  // 7. Google OAuth Sign-in
  async function handleGoogleSignIn(): Promise<void> {
    signInWithGoogle(`${window.location.origin}${target}`, `${window.location.origin}/auth`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-cocoa">
          {authMode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {authMode === "signin"
            ? "Sign in with your phone or email to track your slots and bakes."
            : "Register with your verified phone number to place bakery orders."}
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {/* Google OAuth (Top quick sign-in) */}
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

        {/* SIGN IN FLOW */}
        {authMode === "signin" && (
          <div>
            <Tabs
              value={signInMethod}
              onValueChange={(v) => {
                setSignInMethod(v as "phone" | "email");
                setForgotPasswordMode(false);
              }}
            >
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-secondary/60 p-1">
                <TabsTrigger value="phone" className="rounded-xl text-xs font-semibold">
                  Mobile & OTP
                </TabsTrigger>
                <TabsTrigger value="email" className="rounded-xl text-xs font-semibold">
                  Email & Password
                </TabsTrigger>
              </TabsList>

              {/* PHONE OTP TAB (1ST AND PRIMARY OPTION) */}
              <TabsContent value="phone" className="mt-4 space-y-4">
                {!phoneOtpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-phone" className="text-xs font-semibold">
                        Mobile phone number
                      </Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        We will send a 6-digit OTP to verify your number.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold"
                    >
                      {busy ? "Sending OTP…" : "Send 6-digit OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                    <div className="rounded-2xl bg-secondary/40 p-3 text-center border border-border/50">
                      <p className="text-xs text-muted-foreground">OTP code sent to</p>
                      <p className="text-sm font-bold text-cocoa">{phone}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneOtpSent(false);
                          setPhoneOtp("");
                        }}
                        className="mt-1 text-[11px] text-berry font-semibold underline hover:text-berry/80"
                      >
                        Change number
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="login-otp" className="text-xs font-semibold">
                        Enter 6-digit OTP
                      </Label>
                      <Input
                        id="login-otp"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        required
                        className="rounded-xl text-center text-lg font-mono tracking-widest"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold"
                    >
                      {busy ? "Verifying…" : "Verify & Sign in"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={busy}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
                      >
                        Didn&apos;t get the code? Resend OTP
                      </button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* EMAIL & PASSWORD TAB (SECONDARY OPTION) */}
              <TabsContent value="email" className="mt-4 space-y-4">
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
                        className="rounded-xl"
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold"
                    >
                      {busy ? "Signing in…" : "Sign in with Email"}
                    </Button>
                  </form>
                ) : (
                  /* FORGOT PASSWORD FORM */
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
                        className="rounded-xl"
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
              </TabsContent>
            </Tabs>

            {/* Toggle to Sign Up */}
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
        )}

        {/* SIGN UP FLOW WITH MANDATORY PHONE & OTP */}
        {authMode === "signup" && (
          <div className="space-y-4">
            {!signUpOtpSent ? (
              <form onSubmit={handleSignUpSendOtp} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="reg-name" className="text-xs font-semibold">
                    Full name <span className="text-berry">*</span>
                  </Label>
                  <Input
                    id="reg-name"
                    required
                    placeholder="Full name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="rounded-xl h-10"
                  />
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
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-phone" className="text-xs font-semibold">
                    Mobile phone number <span className="text-berry">*</span>
                  </Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="rounded-xl h-10"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Phone number is verified and permanently linked to your account.
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
                  {busy ? "Sending verification…" : "Verify phone & Create account"}
                </Button>
              </form>
            ) : (
              /* SIGNUP OTP VERIFICATION STEP */
              <form onSubmit={handleSignUpConfirm} className="space-y-4">
                <div className="rounded-2xl bg-secondary/40 p-3 text-center border border-border/50">
                  <p className="text-xs text-muted-foreground">Verify mobile number for registration</p>
                  <p className="text-sm font-bold text-cocoa">{signUpPhone}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpOtpSent(false);
                      setSignUpOtp("");
                    }}
                    className="mt-1 text-[11px] text-berry font-semibold underline hover:text-berry/80"
                  >
                    Edit details
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-otp" className="text-xs font-semibold">
                    Enter 6-digit OTP
                  </Label>
                  <Input
                    id="reg-otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={signUpOtp}
                    onChange={(e) => setSignUpOtp(e.target.value)}
                    required
                    className="rounded-xl text-center text-lg font-mono tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-berry text-berry-foreground hover:bg-berry/90 rounded-2xl h-11 font-semibold"
                >
                  {busy ? "Completing registration…" : "Confirm & Create Account"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSignUpSendOtp}
                    disabled={busy}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
                  >
                    Resend verification code
                  </button>
                </div>
              </form>
            )}

            {/* Toggle back to Sign In */}
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
      </div>
    </div>
  );
}
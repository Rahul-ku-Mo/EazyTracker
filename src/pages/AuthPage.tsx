import { useState } from "react";
import { Link } from "react-router-dom";
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import signInWithGoogle from "@/services/googleSSOService";
import useAuthProvider from "@/hooks/useAuthProvider";

const AuthPage = () => {
  const [signupStatus, setSignupStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    handleChange,
    signinUser,
    signupUser,
    username,
    handleUserNameChange,
    errors,
    isLoading,
  } = useAuthProvider();

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="w-full max-w-sm px-4 py-8">
        <div className="flex flex-col gap-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                  <GalleryVerticalEnd className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold">
                  {signupStatus ? "Create an account" : "Welcome back"}
                </h1>
                <div className="text-sm text-center text-muted-foreground">
                  {signupStatus ? "Already have an account? " : "New here? "}
                  <button
                    onClick={() => setSignupStatus(!signupStatus)}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {signupStatus ? "Sign in" : "Create an account"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {signupStatus && (
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={handleUserNameChange}
                      placeholder="johndoe"
                      className={cn(errors.username && "border-destructive")}
                    />
                    {errors.username && (
                      <p className="text-xs text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange("email")(e)}
                    placeholder="m@example.com"
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs underline text-muted-foreground hover:text-primary underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={(e) => handleChange("password")(e)}
                      placeholder="••••••••"
                      className={cn(errors.password && "border-destructive")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => (signupStatus ? signupUser() : signinUser())}
                >
                  {isLoading
                    ? signupStatus
                      ? "Creating account..."
                      : "Signing in..."
                    : signupStatus
                    ? "Create account"
                    : "Sign in"}
                </Button>
              </div>

              <div className="relative text-center">
                <span className="relative z-10 px-2 text-xs bg-background text-muted-foreground">
                  Or continue with
                </span>
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signInWithGoogle()}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </form>

          <div className="text-xs text-center text-balance text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

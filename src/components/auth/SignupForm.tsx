import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmEmail from "@/components/auth/ConfirmEmail";
import { signupSchema, type SignupFormData } from "@/schemas/signupSchema";

const SignupForm = () => {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    const { error } = await signUp(data.email, data.password, data.name);
    if (error) {
      setError(error.message);
    } else {
      setUserEmail(data.email);
      setShowConfirmation(true);
    }
  };

  const backToSignup = () => {
    setShowConfirmation(false);
    setUserEmail("");
  };

  if (showConfirmation) {
    return <ConfirmEmail userEmail={userEmail} backToSignup={backToSignup} />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">
          Create an account
        </CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs pl-1 text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs pl-1 text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="*****"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs pl-1 text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="*****"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs pl-1 text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;

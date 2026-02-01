import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  userEmail: string;
  backToSignup: () => void;
}

const ConfirmEmail = ({ userEmail, backToSignup }: Props) => {
  const navigate = useNavigate();
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-semibold">
          Check your email
        </CardTitle>
        <CardDescription className="text-base">
          We've sent a confirmation email to
        </CardDescription>
        <p className="font-semibold text-foreground break-all">{userEmail}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                What to do next:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Open your email inbox</li>
                <li>Click the confirmation link in the email</li>
                <li>Return here to sign in</li>
              </ol>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Can't find the email?
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
                <li>
                  Check your <strong>spam or junk folder</strong>
                </li>
                <li>Wait a few minutes and check again</li>
                <li>Make sure you entered the correct email address</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={() => navigate("/login")}
          className="w-full cursor-pointer"
        >
          Go to Sign In
        </Button>
        <Button
          variant="outline"
          onClick={backToSignup}
          className="w-full cursor-pointer"
        >
          Back to Sign Up
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Didn't receive the email? Check your spam folder or try signing up
          again.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ConfirmEmail;

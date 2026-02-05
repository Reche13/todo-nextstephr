import SignupForm from "@/components/auth/SignupForm";
import { GradientBars } from "@/components/common/GradientBars";

const Signup = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-100 to-violet-50 p-4">
      <GradientBars />
      <SignupForm />
    </div>
  );
};

export default Signup;

import LoginForm from "@/components/auth/LoginForm";
import { GradientBars } from "@/components/common/GradientBars";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-100 to-violet-50 p-4">
      <GradientBars />
      <LoginForm />
    </div>
  );
};

export default Login;

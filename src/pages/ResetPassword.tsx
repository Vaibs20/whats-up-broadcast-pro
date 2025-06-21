
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api";
import { 
  MessageSquare, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or missing.",
        variant: "destructive"
      });
      navigate('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate, toast]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Weak Password",
        description: passwordError,
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.response?.data?.error || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "Very Weak";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Good";
    return "Strong";
  };

  if (!token) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <p className="text-gray-600">
            {success 
              ? "Password updated successfully"
              : "Create a new secure password for your account"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                Your password has been successfully updated.
              </p>
              <p className="text-sm text-gray-500">
                You will be redirected to the login page shortly.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Password Strength:</span>
                      <span className={`font-medium ${
                        getPasswordStrength(password) >= 3 ? 'text-green-600' : 
                        getPasswordStrength(password) >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getStrengthText(getPasswordStrength(password))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getStrengthColor(getPasswordStrength(password))}`}
                        style={{ width: `${(getPasswordStrength(password) / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Passwords do not match
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

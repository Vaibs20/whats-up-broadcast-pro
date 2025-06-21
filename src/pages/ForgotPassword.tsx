
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api";
import { 
  MessageSquare, 
  Loader2,
  Mail,
  ArrowLeft,
  Shield,
  Clock
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.forgotPassword(email);
      setSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions. The link will expire in 1 hour.",
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Handle different error scenarios professionally
      const errorMessage = error.response?.data?.error || "Failed to send reset email";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSent(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {sent ? "Check Your Email" : "Forgot Password"}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {sent 
              ? "We've sent password reset instructions to your email"
              : "Enter your email address and we'll send you a link to reset your password"
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    className="pl-11 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-700 font-medium">
                  Reset link sent to
                </p>
                <p className="text-green-600 font-semibold text-lg break-all">
                  {email}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-blue-700 font-medium">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Notice
                </div>
                <div className="text-sm text-blue-600 space-y-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Link expires in 1 hour
                  </div>
                  <p>Check your spam folder if you don't see the email</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleResend}
                  className="w-full h-12 font-medium"
                >
                  Try Different Email
                </Button>
                
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Wait a few minutes before requesting a new one.
                </p>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-green-600 hover:text-green-700 hover:underline font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

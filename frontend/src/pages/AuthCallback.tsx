import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error) {
      toast({
        title: "Authentication Failed",
        description: error,
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (token) {
      // Store token and redirect
      localStorage.setItem('authToken', token);
      toast({
        title: "Welcome!",
        description: "You have been successfully logged in.",
      });
      // Reload to trigger auth context update
      window.location.href = '/';
    } else {
      toast({
        title: "Authentication Failed",
        description: "No authentication token received",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-lg">Completing authentication...</span>
        </div>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
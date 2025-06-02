import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";

const JoinTeamPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: ""
  });

  // Check if user is already logged in
  const accessToken = Cookies.get("accessToken");
  const isLoggedIn = !!accessToken;

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
      validateInviteCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const validateInviteCode = async (code) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/validate-code/${code}`
      );
      
      if (response.data.status === 200) {
        setTeamInfo(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Invalid invite code",
        description: "The invite code is invalid or has expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invite code required",
        description: "Please enter a valid invite code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/join`,
        { code: inviteCode },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.status === 200) {
        toast({
          title: "Successfully joined team!",
          description: `Welcome to ${response.data.data.name}`,
          variant: "default",
        });
        navigate("/workspace");
      }
    } catch (error) {
      toast({
        title: "Failed to join team",
        description: error.response?.data?.message || "An error occurred while joining the team.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (registrationData.password !== registrationData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          email: registrationData.email,
          password: registrationData.password,
          username: registrationData.username,
          inviteCode: inviteCode
        }
      );

      if (response.data.message) {
        // Store the access token
        Cookies.set("accessToken", response.data.accesstoken, { expires: 90 });
        
        toast({
          title: "Account created successfully!",
          description: response.data.message,
          variant: "default",
        });
        navigate("/workspace");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoggedIn) {
    // User is logged in - show join team interface
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Join Team</CardTitle>
              <CardDescription>
                {teamInfo ? (
                  <span>You're invited to join <strong>{teamInfo.name}</strong></span>
                ) : (
                  "Enter your invite code to join a team"
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {teamInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Valid invite code!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Team: {teamInfo.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-wider"
                />
              </div>

              <Button
                onClick={handleJoinTeam}
                disabled={isLoading || !inviteCode.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Joining..." : "Join Team"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/workspace")}
                  className="text-sm"
                >
                  Back to Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is not logged in - show registration/login options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {showRegistration ? "Create Account & Join Team" : "Join Team Invitation"}
            </CardTitle>
            <CardDescription>
              {teamInfo ? (
                <span>You're invited to join <strong>{teamInfo.name}</strong></span>
              ) : (
                "You need to create an account or sign in to join the team"
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {teamInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Valid invite code: {inviteCode}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Team: {teamInfo.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!showRegistration ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setShowRegistration(true)}
                  className="w-full"
                  size="lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  Create New Account
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/auth/login?redirect=/join?code=${inviteCode}`)}
                  className="w-full"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In to Existing Account
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={registrationData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={registrationData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={registrationData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={registrationData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Creating Account..." : "Create Account & Join Team"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRegistration(false)}
                  className="w-full"
                >
                  Back to Options
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinTeamPage; 
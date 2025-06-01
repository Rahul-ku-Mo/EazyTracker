import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Plus, LogIn, Sparkles, Building } from "lucide-react";
import clsx from "clsx";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const Onboarding = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("join");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = Cookies.get("accessToken");

  const { isLoading: isCheckingOnboarding } = useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/onboarding`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { needsOnboarding, isAdmin } = response.data;

      if (!needsOnboarding) {
        // Already onboarded, redirect to boards
        navigate("/workspace");
        return null;
      }

      setIsAdmin(isAdmin);
      return response.data;
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/teams`,
        { name: teamName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      window.location.href = "/workspace";
    },
    onError: (error) => {
      console.error("Team creation failed:", error);
      setError("Failed to create team");
    },
  });

  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/teams/join`,
        { code: joinCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      window.location.href = "/workspace";
    },
    onError: (error) => {
      console.error("Team join failed:", error);
      setError("Failed to join team with the provided code");
    },
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setError("");
    createTeamMutation.mutate();
  };

  const handleJoinTeam = () => {
    if (!joinCode.trim()) {
      setError("Join code is required");
      return;
    }

    setError("");
    joinTeamMutation.mutate();
  };

  const isLoading =
    isCheckingOnboarding ||
    createTeamMutation.isPending ||
    joinTeamMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              Welcome to EzTrack
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Let's get you started
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "As an admin, you can create your own workspace to get started"
                : "Create a new workspace or join an existing team"}
            </p>
          </div>

          <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Building className="h-5 w-5 text-primary" />
                {isAdmin ? "Create Your Workspace" : "Join or Create Workspace"}
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Set up your team workspace to start collaborating"
                  : "Choose how you'd like to get started with EzTrack"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {isAdmin ? (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="team-name"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Users className="h-3 w-3 text-muted-foreground" />
                      Workspace Name
                    </Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your workspace name"
                      className={clsx(
                        "transition-all duration-200",
                        "border-input bg-background text-foreground",
                        "placeholder:text-muted-foreground",
                        "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                        "focus:border-primary"
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose a name that represents your team or organization
                    </p>
                  </div>
                </motion.div>
              ) : (
                <Tabs
                  defaultValue="join"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 mb-6 bg-muted/50">
                    <TabsTrigger
                      value="join"
                      className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Join Team
                    </TabsTrigger>
                    <TabsTrigger
                      value="create"
                      className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="join" className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor="join-code"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <LogIn className="h-3 w-3 text-muted-foreground" />
                        Invitation Code
                      </Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter your invitation code"
                        className={clsx(
                          "transition-all duration-200",
                          "border-input bg-background text-foreground",
                          "placeholder:text-muted-foreground",
                          "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                          "focus:border-primary"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ask your team admin for the invitation code
                      </p>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="create" className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor="create-team-name"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <Users className="h-3 w-3 text-muted-foreground" />
                        Workspace Name
                      </Label>
                      <Input
                        id="create-team-name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter your workspace name"
                        className={clsx(
                          "transition-all duration-200",
                          "border-input bg-background text-foreground",
                          "placeholder:text-muted-foreground",
                          "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                          "focus:border-primary"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose a name that represents your team or project
                      </p>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-6">
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={
                    isAdmin || activeTab === "create" ? handleCreateTeam : handleJoinTeam
                  }
                  disabled={isLoading}
                  className={clsx(
                    "w-full h-11 font-medium transition-all duration-200",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isAdmin || activeTab === "create" ? "Creating workspace..." : "Joining team..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isAdmin || activeTab === "create" ? (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Workspace
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          Join Team
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </Card>

          {/* Footer */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">
              Need help? Contact your administrator or check our documentation
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

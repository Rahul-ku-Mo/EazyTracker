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
import { Loader2 } from "lucide-react";

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

      /**
       * queryClient.invalidateQueries({ queryKey: ['onboarding'] });
       * navigate('/boards');
       */
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_25%_at_50%_50%,rgba(16,185,129,0.05)_0%,rgba(24,24,27,0)_100%)]"></div>

      <motion.div
        className="w-full max-w-md px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-2xl text-center gt-walsheim-font text-zinc-900 dark:text-zinc-50">
                Welcome to your workspace
              </CardTitle>
              <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">
                {isAdmin
                  ? "As an admin, you can create your own workspace"
                  : "Create a new workspace or join an existing one"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
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
                      className="text-zinc-700 dark:text-zinc-300"
                    >
                      Workspace Name
                    </Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={isLoading}
                      className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                      placeholder="My Awesome Team"
                    />
                  </div>
                  {error && (
                    <motion.p
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <Tabs
                  defaultValue="join"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 mb-6 bg-zinc-100 dark:bg-zinc-800">
                    <TabsTrigger
                      value="create"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                    >
                      Create
                    </TabsTrigger>
                    <TabsTrigger
                      value="join"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                    >
                      Join Existing
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor="create-team-name"
                        className="text-zinc-700 dark:text-zinc-300"
                      >
                        Workspace Name
                      </Label>
                      <Input
                        id="create-team-name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        disabled={isLoading}
                        className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                        placeholder="My Awesome Team"
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="join" className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor="join-code"
                        className="text-zinc-700 dark:text-zinc-300"
                      >
                        Join Code
                      </Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        disabled={isLoading}
                        className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                        placeholder="Enter workspace join code"
                      />
                    </motion.div>
                  </TabsContent>

                  {error && (
                    <motion.p
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </Tabs>
              )}
            </CardContent>

            <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
              {isAdmin ? (
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCreateTeam}
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                  >
                    {createTeamMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                      </span>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={
                      activeTab === "create" ? handleCreateTeam : handleJoinTeam
                    }
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                  >
                    {createTeamMutation.isPending ||
                    joinTeamMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {activeTab === "create" ? "Creating..." : "Joining..."}
                      </span>
                    ) : activeTab === "create" ? (
                      "Create Workspace"
                    ) : (
                      "Join Workspace"
                    )}
                  </Button>
                </motion.div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

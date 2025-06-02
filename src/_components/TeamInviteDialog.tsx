import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Copy, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TeamInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamData?: {
    id: string;
    name: string;
    joinCode?: string;
  };
}

const TeamInviteDialog = ({ isOpen, onClose, teamData }: TeamInviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") || "";

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/teams/invite`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: `An invite has been sent to ${email}`,
        variant: "default",
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invite",
        description: error.response?.data?.message || "An error occurred while sending the invite",
        variant: "destructive",
      });
    },
  });

  const handleInvite = () => {
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate(email);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Join code copied to clipboard",
      variant: "default",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join {teamData?.name || 'your team'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Invitation Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Invitation
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={inviteMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleInvite} 
                  disabled={inviteMutation.isPending || !email.trim()}
                  size="sm"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                They'll receive an email notification to join the team
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Join Code Section */}
          {teamData?.joinCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Share Join Code
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Team Join Code</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowJoinCode(!showJoinCode)}
                        className="h-6 w-6 p-0"
                      >
                        {showJoinCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="font-mono text-sm">
                      {showJoinCode ? teamData.joinCode : "••••••••"}
                    </div>
                  </div>
                  {showJoinCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(teamData.joinCode!)}
                      className="shrink-0"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with team members so they can join directly
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInviteDialog; 
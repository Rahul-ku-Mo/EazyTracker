import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const InviteBoardDialog = ({ isOpen, onClose, id }: InviteBoardDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const accessToken = Cookies.get("accessToken") || "";

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: "Email is required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Replace this with your actual API call

      await axios.post(
        `${import.meta.env.VITE_API_URL}/boards/${id}/members`,
        {
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast({
        title: "Invitation sent!",
        description: `An invite has been sent to ${email}`,
        variant: "default",
      });
      setEmail("");
      onClose();
    } catch (err : any) {
      toast({
        title: "Failed to send invite",
        description: err.response.data.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Board</DialogTitle>
          <DialogDescription>
            Enter an email address to invite someone to the board
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm focus-visible:ring-0"
            />
          </div>
          <Button onClick={handleInvite} disabled={isLoading} variant="outline">
            {isLoading ? "Sending..." : "Invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteBoardDialog;

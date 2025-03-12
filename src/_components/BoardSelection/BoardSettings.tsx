import {  useState } from "react";
import { useParams } from "react-router-dom";
import { Trash2, Users, AlertTriangle, Save } from "lucide-react";
import { useBoardMutation } from "@/_components/BoardSelection/_mutations/useBoardMutation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import MainLayout from "@/layouts/Container";
import Cookies from "js-cookie";

import { useBoard } from "@/hooks/useQueries";
import LoadingScreen from "../LoadingScreen";

const BoardSettings = () => {
  const { id } = useParams();

  const accessToken = Cookies.get("accessToken") || "";
 
  const { deleteBoardMutation, updateBoardMutation } = useBoardMutation();

  const { data, isPending } = useBoard(accessToken, id as string);


  const [inviteEmail, setInviteEmail] = useState("");
  const [boardName, setBoardName] = useState(data?.title || "");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your invite logic here
    console.log("Inviting:", inviteEmail);
    setInviteEmail("");
  };

  const handleDeleteBoard = () => {
    deleteBoardMutation.mutate(id as string);
  };

  if (isPending) return <LoadingScreen />;

  console.log(data, isPending)

  return (
    <MainLayout title="Settings" fwdClassName="mx-auto w-full">
      {/* General Settings */}
      <Card className="px-6">
        <CardHeader className="px-0">
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your board settings including name, description, and team
            members.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                placeholder="Enter board name"
                value={data?.title || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateBoardMutation.mutate({
                      boardId: id as string,
                      updatedBoardData: { title: boardName },
                    });
                  }
                }}
                onChange={(e) => setBoardName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-0 flex justify-end ">
          <Button variant="secondary" className="items-center">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Team Members */}
      <Card className="px-6">
        <CardHeader className="px-0">
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Invite and manage team members for this board
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="">
                <Users className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </form>

          <Separator />

          <div>
            <h3 className="mb-3 font-medium">Current Members</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No members yet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border rounded-lg shadow-none border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Board
          </CardTitle>
          <CardDescription>
            The Board will be permanently deleted, including its issues and
            members. This action is irreversible and can not be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground">WK</span>
            </div>
            <div>
              <h4 className="font-medium">{data?.title}</h4>
              <p className="text-sm text-muted-foreground">
                Last updated Jan 26
              </p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger className="flex justify-end mt-4 w-full">
              <Button variant="destructive" className="">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your board and remove all associated data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2 ">
                  <Label className="text-muted-foreground">
                    Please type <span className="font-bold ">{boardName}</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Enter board name to confirm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBoard}
                  disabled={deleteConfirmation !== boardName}
                >
                  Delete Board
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default BoardSettings;

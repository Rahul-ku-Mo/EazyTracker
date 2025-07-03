import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { UseMutationResult } from "@tanstack/react-query";

interface DeleteDialogProps {
  closeModal: () => void;
  isOpen: boolean;
  deleteItem: UseMutationResult<void, Error, string>;
  title: string;
  id: string;
}

const DeleteDialog = ({
  closeModal,
  isOpen,
  deleteItem,
  title,
  id,
}: DeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-bold">Delete {title}</DialogTitle>
          <DialogDescription>
              Are you sure you want to delete <strong>{title}</strong>?

             
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => deleteItem.mutate(id)}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;

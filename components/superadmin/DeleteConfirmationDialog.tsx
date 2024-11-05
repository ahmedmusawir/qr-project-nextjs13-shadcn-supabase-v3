import React, { useState } from "react";
import { Button } from "../ui/button";
import { CustomUser } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUserCompletely } from "@/services/userServices";
import Spinner from "../common/Spinner";

interface Props {
  setSelectedUser: (theUser: CustomUser | null) => void;
  selectedUser: CustomUser | null;
  onDelete: (deletedUserId: string) => void;
}

const DeleteConfirmationDialog = ({
  selectedUser,
  setSelectedUser,
  onDelete,
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to handle deletion confirmation
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true); // Show the spinner
    try {
      // Calling delete service function
      await deleteUserCompletely(selectedUser.id);
      // Calling the onDelete prop to update the parent component's state
      onDelete(selectedUser.id);
      // Closing the modal
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      // Stopping showing the spinner
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <h2 className="text-2xl font-bold">Confirm Deletion</h2>
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to permanently remove user{" "}
            <strong>{selectedUser?.name}</strong> who is a{" "}
            <strong>{selectedUser?.type}</strong>?
          </p>
          <DialogFooter className="flex justify-end space-x-4 mt-4">
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-600 text-white"
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <Spinner /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

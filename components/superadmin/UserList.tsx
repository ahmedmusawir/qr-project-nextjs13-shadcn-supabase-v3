import { CustomUser, User } from "@/types/user";
import { Button } from "../ui/button";
import { useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  users: CustomUser[];
  onDelete: (id: string) => void;
}
const UserList = ({ users, onDelete }: Props) => {
  // console.log("Users:", users);
  const [selectedUser, setSelectedUser] = useState<CustomUser | null>(null);
  const { user } = useAuthStore();

  // console.log("USER ID - UserList.tsx", user.id);

  // Function to open the dialog when delete is clicked
  const handleDeleteClick = (user: CustomUser) => {
    setSelectedUser(user);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {users?.map((person) => (
        <div
          key={person.id}
          className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div className="flex-shrink-0">
            <img
              alt=""
              src="https://res.cloudinary.com/dyb0qa58h/image/upload/v1728878632/user-icon-img_ef8ngu.png"
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="float-end">
              {person.type === "Super Admin" ? (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-red-100 px-4 py-3 text-xs font-medium text-red-700">
                  <svg
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                    className="h-1.5 w-1.5 fill-red-500"
                  >
                    <circle r={3} cx={3} cy={3} />
                  </svg>
                  Super Admin
                </span>
              ) : person.type === "Admin" ? (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-blue-100 px-4 py-3 text-xs font-medium text-blue-700">
                  <svg
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                    className="h-1.5 w-1.5 fill-blue-500"
                  >
                    <circle r={3} cx={3} cy={3} />
                  </svg>
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-gray-100 px-4 py-3 text-xs font-medium text-gray-700">
                  <svg
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                    className="h-1.5 w-1.5 fill-gray-500"
                  >
                    <circle r={3} cx={3} cy={3} />
                  </svg>
                  Member
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
            <h4 className="truncate text-lg text-gray-500">{person.email}</h4>
            {person.id === user.id && (
              <Button
                className="bg-green-700 hover:bg-green-600 text-white ml-3 float-end"
                disabled
              >
                Logged In
              </Button>
            )}
            {person.id !== user.id && (
              <Button
                onClick={() => handleDeleteClick(person)} // Trigger dialog open
                className="bg-red-700 hover:bg-red-600 text-white ml-3 float-end"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      ))}

      {selectedUser && (
        <DeleteConfirmationDialog
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default UserList;

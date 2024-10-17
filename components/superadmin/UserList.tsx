import { User } from "@/types/user";

interface Props {
  users: User[];
}
const UserList = ({ users }: Props) => {
  console.log("Users:", users);
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
              {person.user_metadata.is_qr_superadmin ? (
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
              ) : person.user_metadata.is_qr_admin ? (
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

            <h3 className="text-xl font-bold text-gray-900">
              {person.user_metadata.name}
            </h3>
            <p className="truncate text-sm text-gray-500">{person.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

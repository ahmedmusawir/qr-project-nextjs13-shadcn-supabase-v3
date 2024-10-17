import React from "react";

interface Props {
  user: User;
}

const ProfileHeader = ({ user }: Props) => {
  return (
    <>
      <div className="px-4 sm:px-0 pb-5 sm:pb-12">
        <img
          src="https://res.cloudinary.com/dyb0qa58h/image/upload/v1728878632/user-icon-img_ef8ngu.png"
          alt="Event"
          className="h-32 w-32 rounded-full sm:float-start mr-10 mb-8"
        />
        <h2 className="text-3xl sm:text-4xl font-semibold leading-7 text-gray-900">
          User Information:{" "}
        </h2>
        <p className="mt-5 sm:mt-1 max-w-2xl text-sm leading-6 text-gray-500 font-bold">
          User Status: <span className="text-green-600">{user.aud}</span>
        </p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 font-bold">
          User ID: <span className="text-red-700">{user.id}</span>
        </p>
      </div>
    </>
  );
};

export default ProfileHeader;

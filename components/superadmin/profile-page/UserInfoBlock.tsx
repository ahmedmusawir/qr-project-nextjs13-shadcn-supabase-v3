import { User } from "@/types/user";
import { formatDate } from "@/utils/common/commonUtils";
import React from "react";

interface Props {
  user: User;
}

const UserInfoBlock = ({ user }: Props) => {
  // console.log("USER:", user);
  return (
    <>
      {/* Large Screen Layout (Double-Column) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Left Column (Table 1) */}
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Full Name:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {user.user_metadata.name}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-2 pl-3 md:py-3 md:pl-5">
                Email Address:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center">
                {user.email}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Phone Number
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {user.phone ? user.phone : "No Number Listed"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Right Column (Table 2) */}
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Last Logged In:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {formatDate(user.last_sign_in_at)}
              </td>
            </tr>

            <tr className="bg-white">
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-2 pl-3 md:py-3 md:pl-5">
                User Created At:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center">
                {formatDate(user.created_at)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                User Type:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {user.user_metadata.is_qr_superadmin
                  ? "Super Admin"
                  : "Type Unknown"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Small Screen Layout (Single-Column) */}
      <div className="block md:hidden mt-5">
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                Full Name:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                {user.user_metadata.name}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                Email Address:
              </td>
              <td className="text-center text-sm text-gray-700 dark:text-gray-300 bg-white py-3">
                {user.email}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                Phone Number:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                {user.phone ? user.phone : "No Number Listed"}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                Last Logged In:
              </td>
              <td className="text-center text-sm text-gray-700 dark:text-gray-300 bg-white py-3">
                {formatDate(user.last_sign_in_at)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                User Created At:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                {formatDate(user.created_at)}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                User Type
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 text-center bg-white py-3">
                {user.identities[0].identity_data.is_qr_admin
                  ? "Admin"
                  : "Type Unknown"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserInfoBlock;

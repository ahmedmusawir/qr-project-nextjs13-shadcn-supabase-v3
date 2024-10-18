// /services/userServices.ts
import { createClient } from "@/utils/supabase/client";
import { CustomUser, User } from "@/types/user"; // Assuming you have a custom User type for ghl_qr_users

/**
 * Fetches the list of users from the `ghl_qr_users` table using the Supabase client.
 * This function makes a request to the Supabase database to retrieve user data stored in your custom table.
 *
 * @returns {Promise<User[]>} - Returns an array of users from the `ghl_qr_users` table, or an empty array if an error occurs.
 */
export const fetchUsers = async (): Promise<CustomUser[]> => {
  try {
    const supabase = createClient();

    // Query the ghl_qr_users table
    const { data, error } = await supabase.from("ghl_qr_users").select("*");

    if (error) {
      console.error(
        "Error fetching users from ghl_qr_users table:",
        error.message
      );
      throw new Error("Failed to fetch users");
    }

    // Return the users data or an empty array if none found
    return data || [];
  } catch (err) {
    console.error("Error fetching users from API:", err);
    return [];
  }
};

// Inserts newly created users via supabase.auth.admin, to our qrapp custom user table - mainly because
// Supabase admin api sux ... it never updates the user data
export const addUserToCustomTable = async (
  id: string,
  name: string,
  email: string,
  type: string
) => {
  const response = await fetch("/api/qrapp/users/add-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      email,
      type,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add user to ghl_qr_users");
  }

  return await response.json();
};

// Delete the user from our custom user table after we delete the supabase
// User via supabase.auth.admin
export const deleteUserFromCustomTable = async (id: string) => {
  const response = await fetch("/api/qrapp/users/delete-user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete user from ghl_qr_users");
  }

  return await response.json();
};

// Function to add a new user as a superadmin using the API route. But this is using
// supabase.auth.admin API ... This is adding to the Supabase's own users table
export const superadminAddNewUser = async (
  email: string,
  password: string,
  user_metadata: { name: string; is_qr_admin: number; is_qr_superadmin: number }
) => {
  try {
    // Sending the POST request to the API route with the necessary data
    const response = await fetch("/api/superadmin/add-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata,
      }),
    });

    // Handle non-200 response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add new user");
    }

    const data = await response.json();
    return data; // Successfully added user, return the data
  } catch (error: any) {
    console.error("Error adding new user:", error.message);
    throw new Error(error.message); // Propagate the error back to the calling component
  }
};

/**
 * Updates the user's password using Supabase authentication.
 * This function uses Supabase's `updateUser` method to set a new password for the logged-in user.
 *
 * @param {string} newPassword - The new password to be set for the user.
 * @returns {Promise<null | Error>} - Returns null if the password update is successful,
 *                                    or returns an error object if there is an issue.
 */
export const updatePassword = async (newPassword: string) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return error; // Return the error object
  }

  return null; // Return null if there is no error
};

/**
 * Fetches the list of users by calling the /api/admin API route.
 * This function makes a GET request to the custom API route where
 * the Supabase admin API handles the user fetching logic.
 * THIS IS JUST CODE SAMPLE KEPT AS AN EXAMPLE ON HOW TO GET USERS FROM SUPBASE'S USERS TABLE
 *
 * @returns {Promise<User[]>} - Returns an array of users from the API, or an empty array if an error occurs.
 */
// export const fetchUsers = async () => {
//   try {
//     // Fetch the data from your API route
//     const response = await fetch("/api/admin", {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch users");
//     }

//     const result = await response.json();
//     // console.log("FETCH USER:", result.data.users);
//     const users = result.data.users;

//     // Return the users data
//     return users || [];
//   } catch (err) {
//     console.error("Error fetching users from API route:", err);
//     return [];
//   }
// };

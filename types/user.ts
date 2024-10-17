export interface User {
  id: string; // User's unique ID
  aud: string; // Audience (refers to the intended audience of the token)
  email: string; // User's email
  phone: string | null; // Phone can be null
  user_metadata: {
    is_qr_admin: number; // Whether the user is an admin (1 for true, 0 for false)
    is_qr_member: number; // Whether the user is a member (1 for true, 0 for false)
    is_qr_superadmin: number; // Whether the user is a superadmin (1 for true, 0 for false)
    name: string; // User's name
  };
  identities: {
    identity_id: string; // Identity ID
    id: string; // Identity's unique ID
    user_id: string; // User ID associated with the identity
    identity_data: {
      email: string; // Email from identity data
      is_qr_admin: number; // Admin status from identity data
      is_qr_member: number; // Member status from identity data
      is_qr_superadmin: number; // Superadmin status from identity data
      name: string; // Name from identity data
    };
    provider: string; // Identity provider (e.g., 'email')
  }[];
  last_sign_in_at: string; // Last sign-in time
  created_at: string; // User creation time
  updated_at: string; // User update time
}

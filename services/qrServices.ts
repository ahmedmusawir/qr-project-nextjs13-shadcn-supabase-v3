// /services/qrServices.ts

import { createClient } from "@/utils/supabase/server";

// Updating the QR Image in ghl_qr_orders table by order id
export const updateQrCodeImage = async (
  orderId: string,
  qrCodeImage: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("ghl_qr_orders")
    .update({ qr_code_image: qrCodeImage })
    .eq("order_id", orderId);

  if (error) {
    throw new Error(`Failed to update QR code image: ${error.message}`);
  }
};

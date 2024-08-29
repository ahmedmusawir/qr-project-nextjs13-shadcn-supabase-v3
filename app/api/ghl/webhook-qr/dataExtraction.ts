export interface WebhookData {
  contact_id: string;
  product_id: string;
  order_id: string;
}

export const extractWebhookData = (payload: any): WebhookData | null => {
  try {
    const contact_id = payload.contact_id;
    const order_id = payload.order.line_items[0].meta.order_id;
    const product_id = payload.order.line_items[0].meta.product_id;

    // Ensure that all necessary fields are present
    if (!contact_id || !order_id || !product_id) {
      console.error("Missing required data in webhook payload");
      return null;
    }

    return { contact_id, product_id, order_id };
  } catch (error) {
    console.error("Error extracting data from webhook payload:", error);
    return null;
  }
};

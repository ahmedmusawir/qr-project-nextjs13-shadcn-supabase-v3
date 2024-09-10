import QRCode from "qrcode";

/**
 * Generates a QR code image as a data URL.
 * @param {string} text - The text or URL to encode in the QR code.
 * @returns {Promise<string>} - A promise that resolves to a data URL of the QR code image.
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Utility: /utils/ticketTypeGenerator.ts
 *
 * This utility script fetches ticket prices from the GHL API for all provided product IDs
 * and generates a JSON file that contains the ticket types associated with each product.
 * The generated JSON is saved in the `public/ticket_types.json` file.
 *
 * Steps:
 * 1. For each product ID, the script calls the `/api/ghl/price` endpoint with the
 *    product ID and location ID.
 * 2. It collects the price names (such as "VIP", "Regular") for each product.
 * 3. The result is formatted as an array of product objects, where each object contains
 *    the `product_id` and an array of `ticket_types`.
 * 4. The formatted data is saved as `ticket_types.json` in the `public` folder to be
 *    easily accessible by other parts of the application.
 *
 * Parameters:
 * - productIds: An array of product IDs for which the ticket prices need to be fetched.
 * - locationId: The location ID required by the GHL API, fetched from environment variables.
 *
 * Key Functions:
 * - fetchPrices: Fetches the price data from the `/api/ghl/price` endpoint for a given
 *   product ID and location ID.
 * - generateTicketTypesJson: Iterates through all product IDs, fetches their respective
 *   ticket types, and saves them to a JSON file.
 *
 * Usage:
 * This script is triggered on the `/auth` page during the app's load process, ensuring
 * the ticket types are cached in a JSON file to minimize repeated external API calls
 * during webhook invocations.
 */
// import fs from "fs";
// import path from "path";

async function fetchPrices(productId: string, locationId: string) {
  // Use a full URL instead of a relative one
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/price?product_id=${productId}&location_id=${locationId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        Version: "2021-07-28",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prices for product: ${productId}`);
    }

    const data = await response.json();
    return data.prices; // assuming prices is the key you're extracting
  } catch (error) {
    console.error(`Failed to fetch prices for product: ${productId}`, error);
    throw error;
  }
}

export async function generateTicketTypesJson(
  productIds: string[],
  locationId: string
): Promise<
  Array<{ product_id: string; ticket_types: Array<{ name: string }> }>
> {
  const ticketTypesArray: Array<{
    product_id: string;
    ticket_types: Array<{ name: string }>;
  }> = [];

  for (const productId of productIds) {
    try {
      const prices = await fetchPrices(productId, locationId);
      ticketTypesArray.push({
        product_id: productId, // This is now correctly typed
        ticket_types: prices.map((price: { name: string }) => ({
          name: price.name,
        })),
      });
    } catch (error) {
      console.error(`Failed to fetch prices for product: ${productId}`, error);
    }
  }

  return ticketTypesArray;
}

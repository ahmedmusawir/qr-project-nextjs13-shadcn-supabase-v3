import fs from "fs";
import path from "path";
import { createCustomLogger } from "@/utils/logging/logger";

// Function to fetch the list of valid orders from a JSON file
export const getValidOrderIds = () => {
  const validOrderListPath = path.join(
    process.cwd(),
    "public",
    "valid_order_list.json"
  );
  const validOrderIds = JSON.parse(
    fs.readFileSync(validOrderListPath, "utf-8")
  );
  return validOrderIds;
};

// Logging utility function
export const logger = createCustomLogger("ghl-order-sync", "sync");

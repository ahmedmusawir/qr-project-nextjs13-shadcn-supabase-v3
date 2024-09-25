import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Path to the valid_order_list.json file
    const filePath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const validOrderList = JSON.parse(fileContent);

    // Total number of valid orders
    const totalOrders = validOrderList.length;

    return NextResponse.json({ totalOrders });
  } catch (error) {
    console.error("Error reading valid_order_list.json:", error);
    return NextResponse.json(
      { error: "Failed to get total orders" },
      { status: 500 }
    );
  }
}

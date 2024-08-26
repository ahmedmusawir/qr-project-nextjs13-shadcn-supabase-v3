// /api/ghl/qrtest/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateQRCode } from "@/utils/qrapp/helpers";
import { updateQrCodeImage } from "@/services/qrServices";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: "GET request successful" },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const orderId = data.order_id;

    console.log("ORDER DATA FROM POSTMAN: ", data);

    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${orderId}`;
    const qrCodeImage = await generateQRCode(qrCodeURL);

    console.log("Generated QR code URL:", qrCodeURL);
    console.log("Generated QR code image:", qrCodeImage);

    // Update the QR code image in the Supabase database
    await updateQrCodeImage(orderId, qrCodeImage);

    return NextResponse.json(
      {
        message: "QR code generated and updated successfully",
        qrCodeURL,
        qrCodeImage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating QR code:", error);

    return NextResponse.json(
      { error: `Failed to generate QR code: ${error.message}` },
      { status: 500 }
    );
  }
}

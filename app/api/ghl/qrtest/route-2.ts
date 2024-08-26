import { NextRequest, NextResponse } from "next/server";
import { generateQRCode } from "@/utils/qrapp/helpers";

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

    console.log("ORDER DATA FROM POSTMAN:", data);

    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${orderId}`;

    console.log("Generated QR code URL:", qrCodeURL);

    // Generate the QR code
    const qrCodeImage = await generateQRCode(qrCodeURL);

    console.log("Generated QR Code Image:", qrCodeImage);

    return NextResponse.json(
      {
        message: "QR code generated successfully",
        qrCodeURL,
        qrCodeImage, // Base64 image data or a URL if using a file-based approach
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating QR code:", error);

    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 400 }
    );
  }
}

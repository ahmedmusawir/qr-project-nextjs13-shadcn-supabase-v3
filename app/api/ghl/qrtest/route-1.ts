import { NextRequest, NextResponse } from "next/server";

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

    console.log("Generated QR code URL:", qrCodeURL);

    return NextResponse.json(
      { message: "QR code URL generated successfully", qrCodeURL },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating QR code URL:", error);

    return NextResponse.json(
      { error: "Failed to generate QR code URL" },
      { status: 400 }
    );
  }
}

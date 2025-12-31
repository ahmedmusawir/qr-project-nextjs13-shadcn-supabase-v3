# QR Code Generation

This document describes the QR code generation system in QR Project V3, including the generation process, encoding format, storage mechanism, and integration with GoHighLevel custom fields.

---

## Overview

The QR Code Generation feature automatically creates unique QR codes for each order placed through GoHighLevel. These QR codes encode order validation URLs and are stored both in Supabase and updated back to GHL contact custom fields.

### Key Features

- **Automatic Generation** - QR codes generated via webhook on order creation
- **Base64 Encoding** - QR codes stored as data URLs for easy display
- **High Error Correction** - Level H error correction for reliability
- **GHL Integration** - Automatic update to contact custom fields
- **URL Encoding** - Each QR code encodes a unique validation URL

---

## QR Code Generation Process

```
Order Created in GHL
    ↓
Webhook Triggered → /api/ghl/webhook-qr
    ↓
Extract order_id from payload
    ↓
Generate URL: https://domain.com/orders/{order_id}
    ↓
Generate QR Code (PNG, Base64)
    ↓
Update GHL Contact Custom Field
    ↓
Store in Supabase (qr_code_image column)
```

![GHL Webhook Integration](../images/ghl-webhook-integration.png)

---

## QR Code Library

The system uses the **`qrcode`** npm package for QR code generation:

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

**Package Version:** `qrcode@1.5.3`

---

## Generation Implementation

### Core Function

**File Location:** `utils/qrapp/helpers.ts:8`

```typescript
import QRCode from "qrcode";

/**
 * Generates a QR code image as a data URL.
 * @param {string} text - The text or URL to encode in the QR code.
 * @returns {Promise<string>} - A promise that resolves to a data URL of the QR code image.
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',  // High error correction (30% recovery)
      type: 'image/png',           // PNG format
      width: 300,                  // 300x300 pixels
      margin: 1,                   // Minimal margin (1 module)
      color: {
        dark: '#000000',           // Black modules
        light: '#FFFFFF'           // White background
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};
```

### QR Code Configuration

| Option | Value | Description |
|--------|-------|-------------|
| `errorCorrectionLevel` | `'H'` | 30% error correction, highest level |
| `type` | `'image/png'` | PNG image format |
| `width` | `300` | 300x300 pixel dimensions |
| `margin` | `1` | 1 module margin around QR code |
| `color.dark` | `'#000000'` | Black QR modules |
| `color.light` | `'#FFFFFF'` | White background |

### Error Correction Levels

| Level | Error Correction | Use Case |
|-------|------------------|----------|
| `L` | 7% | Clean environments, large QR codes |
| `M` | 15% | Standard use (default) |
| `Q` | 25% | Moderate damage tolerance |
| `H` | 30% | **Maximum reliability** (used in this app) |

---

## Webhook Integration

When a new order is created in GHL, the webhook automatically generates a QR code:

**File Location:** `app/api/ghl/webhook-qr/route.ts:26`

```typescript
export async function POST(req: NextRequest) {
  try {
    // Step 1: Extract webhook data
    const webhookData = await req.json();
    const extractedData = extractWebhookData(webhookData);

    if (!extractedData || !extractedData.order_id) {
      throw new Error("Missing required data from webhook.");
    }

    // Step 2: Generate QR code URL
    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${extractedData.order_id}`;

    // Step 3: Generate QR code image
    const qrCodeImage = await generateQRCode(qrCodeURL);

    // qrCodeImage is now a base64 data URL:
    // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."

    // Step 4: Update GHL contact custom field
    await updateGHLField(
      extractedData.contact_id,
      extractedData.product_id,
      qrCodeImage
    );

    // Step 5: Trigger order sync (stores QR code in Supabase)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/orders/${extractedData.order_id}`, {
      method: "GET",
    });

    return NextResponse.json({
      message: "QR code generated successfully",
      qrCodeURL,
      qrCodeImage,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating QR code:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## QR Code URL Format

Each QR code encodes a unique validation URL:

```
https://your-domain.com/orders/{order_id}
```

**Example:**
```
https://qr-app.example.com/orders/order_abc123
```

### URL Parameters

- **Base URL:** `process.env.NEXT_PUBLIC_API_BASE_URL`
- **Path:** `/orders/`
- **Order ID:** Unique GHL order identifier

### Environment Variable

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

---

## Base64 Data URL Format

Generated QR codes are returned as base64-encoded data URLs:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATIAAAEyCAIAAABbk3+/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABQrSURBVHhe7Z0...
```

### Format Breakdown

```
data:image/png;base64,{base64_encoded_png_data}
│    │         │       │
│    │         │       └─ Actual PNG data
│    │         └───────── Encoding type
│    └─────────────────── MIME type
└──────────────────────── Data URL prefix
```

### Benefits of Data URLs

1. **No External Files** - Embedded directly in database or HTML
2. **Immediate Display** - No additional HTTP requests
3. **Easy Transfer** - Single string for storage and API responses
4. **Cross-platform** - Works in all browsers and platforms

---

## Storing QR Codes in Supabase

QR codes are stored in the `qr_code_image` column of `ghl_qr_orders`:

```sql
-- ghl_qr_orders table
CREATE TABLE ghl_qr_orders (
  order_id TEXT PRIMARY KEY,
  -- ... other columns ...
  qr_code_image TEXT,  -- Base64 data URL
  -- ... other columns ...
);
```

**Insert Example:**
```sql
INSERT INTO ghl_qr_orders (order_id, qr_code_image)
VALUES (
  'order_abc123',
  'data:image/png;base64,iVBORw0KGgoAAAANS...'
);
```

**Query Example:**
```sql
SELECT order_id, qr_code_image
FROM ghl_qr_orders
WHERE order_id = 'order_abc123';
```

---

## Updating GHL Custom Fields

After generation, the QR code is uploaded to the contact's custom field in GHL:

**File Location:** `app/api/ghl/webhook-qr/updateGHLField.ts`

```typescript
export async function updateGHLField(
  contactId: string,
  productId: string,
  qrCodeImage: string
) {
  // Step 1: Get custom field mapping from database
  const { data: fieldMapping } = await supabase
    .from("ghl_qr_fields")
    .select("field_id")
    .eq("product_id", productId)
    .single();

  if (!fieldMapping) {
    throw new Error(`No field mapping found for product: ${productId}`);
  }

  const fieldId = fieldMapping.field_id;

  // Step 2: Update GHL contact with QR code
  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        customFields: [
          {
            id: fieldId,
            value: qrCodeImage,  // Base64 data URL
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update GHL contact: ${response.statusText}`);
  }

  return response.json();
}
```

### Custom Field Mapping Table

```sql
-- ghl_qr_fields table
CREATE TABLE ghl_qr_fields (
  id SERIAL PRIMARY KEY,
  product_id TEXT UNIQUE,
  field_id TEXT,
  field_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Data:**
```sql
INSERT INTO ghl_qr_fields (product_id, field_id, field_name)
VALUES ('product_abc123', 'field_xyz789', 'Event QR Code');
```

---

## Displaying QR Codes

### In React Components

```typescript
"use client";

import { useEffect, useState } from "react";

export default function OrderQRCode({ orderId }: { orderId: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await fetch(`/api/qrapp/orders/${orderId}`);
      const { order } = await response.json();
      setQrCode(order.qr_code_image);
    };

    fetchOrder();
  }, [orderId]);

  if (!qrCode) {
    return <p>Loading QR Code...</p>;
  }

  return (
    <div>
      <h2>Order QR Code</h2>
      <img src={qrCode} alt="Order QR Code" width={300} height={300} />
      <p>Scan to validate order</p>
    </div>
  );
}
```

### In HTML/Email

```html
<img
  src="data:image/png;base64,iVBORw0KGgoAAAANS..."
  alt="Order QR Code"
  width="300"
  height="300"
/>
```

---

## QR Code Scanning

### Mobile Scanning

Users can scan QR codes with:
- **Native Camera App** (iOS 11+, Android 9+)
- **Dedicated QR Scanner Apps**
- **Admin Portal Validation Page**

### Validation Flow

```
User Scans QR Code
    ↓
Redirects to: /orders/{order_id}
    ↓
Admin Portal Loads Order Details
    ↓
Displays Tickets & Validation Controls
    ↓
Admin Validates Tickets (Updates status to "used")
```

---

## Manual QR Code Generation

For testing or manual order creation:

```typescript
import { generateQRCode } from "@/utils/qrapp/helpers";

async function createManualQRCode(orderId: string) {
  const qrCodeURL = `https://your-domain.com/orders/${orderId}`;
  const qrCodeImage = await generateQRCode(qrCodeURL);

  // Save to database or display
  console.log("QR Code:", qrCodeImage);

  return qrCodeImage;
}

// Usage
const qrCode = await createManualQRCode("order_test_123");
```

---

## QR Code Download

### Download as PNG

```typescript
"use client";

export default function DownloadQRButton({ qrCodeImage }: { qrCodeImage: string }) {
  const handleDownload = () => {
    // Create download link
    const link = document.createElement("a");
    link.href = qrCodeImage;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  return (
    <button onClick={handleDownload}>
      Download QR Code
    </button>
  );
}
```

---

## QR Code Size Optimization

### Current Size

- **Dimensions:** 300x300 pixels
- **File Size:** ~2-5 KB (base64)
- **Database Storage:** ~3-7 KB (with data URL prefix)

### Size Comparison

| Width | File Size | Use Case |
|-------|-----------|----------|
| 150px | ~1 KB | Email embeds |
| 300px | ~3 KB | **Standard display** (current) |
| 600px | ~10 KB | Print materials |
| 1000px | ~25 KB | Large posters |

### Optimization Options

```typescript
// Generate smaller QR code for emails
const qrCodeSmall = await QRCode.toDataURL(text, {
  width: 150,
  margin: 1,
  errorCorrectionLevel: 'M',  // Lower error correction
});

// Generate larger QR code for print
const qrCodeLarge = await QRCode.toDataURL(text, {
  width: 600,
  margin: 2,
  errorCorrectionLevel: 'H',
});
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to generate QR code` | Invalid input text | Validate URL format |
| `Missing required data from webhook` | Incomplete webhook payload | Check GHL workflow configuration |
| `No field mapping found for product` | Missing custom field mapping | Add mapping to `ghl_qr_fields` |
| `Failed to update GHL contact` | Invalid GHL access token | Verify `GHL_ACCESS_TOKEN` env variable |

### Error Logging

```typescript
try {
  const qrCodeImage = await generateQRCode(qrCodeURL);
} catch (error) {
  console.error("QR Code generation failed:", {
    error: error.message,
    qrCodeURL,
    timestamp: new Date().toISOString(),
  });

  // Fallback: Generate simpler QR code
  const fallbackQR = await QRCode.toDataURL(qrCodeURL, {
    errorCorrectionLevel: 'L',
    width: 200,
  });

  return fallbackQR;
}
```

---

## Testing QR Code Generation

### Unit Test

```typescript
import { generateQRCode } from "@/utils/qrapp/helpers";

describe("generateQRCode", () => {
  it("should generate a valid data URL", async () => {
    const text = "https://example.com/orders/test123";
    const qrCode = await generateQRCode(text);

    expect(qrCode).toMatch(/^data:image\/png;base64,/);
    expect(qrCode.length).toBeGreaterThan(100);
  });

  it("should throw error for empty text", async () => {
    await expect(generateQRCode("")).rejects.toThrow();
  });
});
```

### Manual Testing

```bash
# Test QR code generation via webhook
curl -X POST http://localhost:4001/api/ghl/webhook-qr \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "_id": "test_order_123",
      "contactId": "test_contact",
      "items": [{ "product": { "_id": "test_product" } }]
    }
  }'
```

---

## Related Documentation

- [Event Ticketing](/docs/features/event-ticketing.md) - Event and order management
- [Webhook Integration](/docs/api/webhook-integration.md) - Webhook processing flow
- [Ticket Validation](/docs/features/ticket-validation.md) - QR code scanning and validation
- [Database Schema](/docs/database/schema.md) - QR code storage structure

---

**Last Updated:** December 31, 2025

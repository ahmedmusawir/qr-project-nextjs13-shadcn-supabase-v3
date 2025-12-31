# Webhook Integration API

This document describes the GHL webhook integration endpoint that handles real-time order notifications, generates QR codes, and triggers automatic database synchronization.

---

## Overview

The webhook integration is the core automation mechanism that connects GoHighLevel CRM orders to the QR Project V3. When a new order is placed in GHL, a webhook triggers the QR code generation and database sync process.

### Webhook Flow

```
GHL Order Created
    ↓
GHL Webhook Triggered
    ↓
POST /api/ghl/webhook-qr
    ↓
Extract Order Data
    ↓
Generate QR Code
    ↓
Update GHL Custom Field
    ↓
Trigger Order Sync (Background)
    ↓
Supabase Database Updated
```

![GHL Webhook Integration](../images/ghl-webhook-integration.png)

**File Location:** `app/api/ghl/webhook-qr/route.ts:26`

---

## Webhook Endpoint

### POST /api/ghl/webhook-qr

**Description:** Receives webhook notifications from GHL when new orders are created. Automatically generates QR codes and syncs order data to Supabase.

**URL:**
```
https://your-domain.com/api/ghl/webhook-qr
```

**Method:** `POST`

**Content-Type:** `application/json`

---

## Webhook Request Payload

GHL sends the following payload when an order is created:

```json
{
  "type": "OrderCreate",
  "locationId": "location_123",
  "order": {
    "_id": "order_abc123",
    "contactId": "contact_xyz789",
    "items": [
      {
        "product": {
          "_id": "product_def456",
          "name": "Summer Concert 2025",
          "price": {
            "amount": 50,
            "currency": "USD"
          }
        },
        "qty": 2
      }
    ],
    "amount": {
      "total": 100,
      "currency": "USD"
    },
    "status": "completed",
    "fulfillmentStatus": "unfulfilled",
    "createdAt": "2025-12-31T10:00:00.000Z"
  }
}
```

---

## Webhook Response

### Success Response (200 OK)

```json
{
  "message": "QR code generated, GHL contact updated, and order sync triggered successfully.",
  "qrCodeURL": "https://your-domain.com/orders/order_abc123",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "updateResult": {
    "contact": {
      "id": "contact_xyz789",
      "customFields": {
        "qr_code_field": "data:image/png;base64,iVBORw0KGgoAAAANS..."
      }
    }
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to process webhook data & update GHL contact: Missing required data from webhook."
}
```

---

## Implementation

```typescript
// app/api/ghl/webhook-qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractWebhookData } from "./dataExtraction";
import { generateQRCode } from "@/utils/qrapp/helpers";
import { updateGHLField } from "./updateGHLField";

export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse and extract webhook data
    const webhookData = await req.json();
    const extractedData = extractWebhookData(webhookData);

    // Validate extracted data
    if (
      !extractedData ||
      !extractedData.contact_id ||
      !extractedData.product_id ||
      !extractedData.order_id
    ) {
      throw new Error("Missing required data from webhook.");
    }

    console.log("Extracted Data:", extractedData);

    // Step 2: Generate QR code
    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${extractedData.order_id}`;
    const qrCodeImage = await generateQRCode(qrCodeURL);

    // Step 3: Update GHL contact with QR code
    const updateResult = await updateGHLField(
      extractedData.contact_id,
      extractedData.product_id,
      qrCodeImage
    );

    // Step 4: Trigger async order sync
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/orders/${extractedData.order_id}`,
      { method: "GET" }
    )
      .then((response) => response.json())
      .then((orderSyncResult) => {
        console.log(
          `Order ${extractedData.order_id} synced successfully:`,
          orderSyncResult
        );
      })
      .catch((error) => {
        console.error(
          `Failed to sync order ${extractedData.order_id}:`,
          error.message
        );
      });

    // Step 5: Return success response
    return NextResponse.json(
      {
        message: "QR code generated, GHL contact updated, and order sync triggered successfully.",
        qrCodeURL,
        qrCodeImage,
        updateResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Error processing webhook data & updating GHL contact:",
      error.message
    );
    return NextResponse.json(
      {
        error: `Failed to process webhook data & update GHL contact: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
```

---

## Data Extraction

The webhook payload is processed to extract key information:

```typescript
// app/api/ghl/webhook-qr/dataExtraction.ts
export interface WebhookData {
  order_id: string;
  contact_id: string;
  product_id: string;
}

export function extractWebhookData(payload: any): WebhookData | null {
  try {
    const order_id = payload.order?._id;
    const contact_id = payload.order?.contactId;
    const product_id = payload.order?.items?.[0]?.product?._id;

    if (!order_id || !contact_id || !product_id) {
      return null;
    }

    return {
      order_id,
      contact_id,
      product_id,
    };
  } catch (error) {
    console.error("Error extracting webhook data:", error);
    return null;
  }
}
```

**Extracted Fields:**
- `order_id` - Unique GHL order identifier
- `contact_id` - GHL contact (customer) identifier
- `product_id` - Product/event identifier

---

## QR Code Generation

The QR code is generated using the `qrcode` library and encoded as a base64 data URL:

```typescript
// utils/qrapp/helpers.ts
import QRCode from "qrcode";

export const generateQRCode = async (text: string): Promise<string> => {
  const qrCodeDataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',  // High error correction
    type: 'image/png',
    width: 300,                  // 300x300 pixels
    margin: 1,                   // Minimal margin
  });

  return qrCodeDataUrl; // Returns: "data:image/png;base64,..."
};
```

**QR Code URL Format:**
```
https://your-domain.com/orders/{order_id}
```

This URL points to the ticket validation page where admins can scan and verify tickets.

---

## GHL Custom Field Update

After generating the QR code, it's uploaded to the GHL contact's custom field:

```typescript
// app/api/ghl/webhook-qr/updateGHLField.ts
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
            value: qrCodeImage, // Base64 data URL
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

### Custom Field Mapping

The `ghl_qr_fields` table stores mappings between products and custom fields:

| Column | Type | Description |
|--------|------|-------------|
| product_id | TEXT | GHL product/event ID |
| field_id | TEXT | GHL custom field ID for QR code |
| field_name | TEXT | Human-readable field name |

**Example:**
```sql
INSERT INTO ghl_qr_fields (product_id, field_id, field_name)
VALUES ('product_abc123', 'field_xyz789', 'Event QR Code');
```

---

## Background Order Sync

After updating the GHL contact, the webhook triggers an asynchronous order sync:

```typescript
// Non-blocking background sync
fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/orders/${extractedData.order_id}`,
  { method: "GET" }
)
  .then((response) => response.json())
  .then((orderSyncResult) => {
    console.log(`Order ${extractedData.order_id} synced successfully`);
  })
  .catch((error) => {
    console.error(`Failed to sync order ${extractedData.order_id}:`, error.message);
  });
```

This ensures the webhook responds quickly to GHL while order data is synced in the background.

---

## Setting Up the Webhook in GHL

### Step 1: Navigate to Workflows

1. Log in to your GoHighLevel account
2. Go to **Automations** → **Workflows**

### Step 2: Create Order Webhook

1. Create a new workflow or edit existing
2. Add a trigger: **Order Created**
3. Add an action: **Webhook**

### Step 3: Configure Webhook

**Webhook URL:**
```
https://your-domain.com/api/ghl/webhook-qr
```

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (Custom Values):**
```json
{
  "type": "OrderCreate",
  "locationId": "{{location.id}}",
  "order": {
    "_id": "{{order.id}}",
    "contactId": "{{contact.id}}",
    "items": {{order.items}},
    "amount": {{order.amount}},
    "status": "{{order.status}}",
    "createdAt": "{{order.createdAt}}"
  }
}
```

### Step 4: Test the Webhook

1. Create a test order in GHL
2. Check webhook logs in GHL workflow
3. Verify QR code appears in contact's custom field
4. Check Supabase database for new order record

---

## Development Testing with ngrok

For local testing, expose your localhost with ngrok:

```bash
# Start your Next.js server
npm run dev

# In another terminal, start ngrok
ngrok http 4001
```

**ngrok Output:**
```
Forwarding https://abc123.ngrok.io -> http://localhost:4001
```

**Use ngrok URL in GHL webhook:**
```
https://abc123.ngrok.io/api/ghl/webhook-qr
```

---

## Webhook Security

### Recommended Security Measures

1. **Webhook Secret Validation**
```typescript
const webhookSecret = req.headers.get("x-webhook-secret");
if (webhookSecret !== process.env.GHL_WEBHOOK_SECRET) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

2. **IP Whitelisting**
```typescript
const clientIP = req.headers.get("x-forwarded-for");
const allowedIPs = ["123.456.789.0"]; // GHL IP addresses
if (!allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

3. **Request Signature Verification**
- Implement HMAC signature validation for webhook payloads

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing required data from webhook` | Incomplete webhook payload | Verify GHL workflow configuration |
| `No field mapping found for product` | Missing custom field mapping | Add mapping to `ghl_qr_fields` table |
| `Failed to update GHL contact` | Invalid GHL access token | Check `GHL_ACCESS_TOKEN` env variable |
| `QR code generation failed` | Network error or invalid data | Check order ID format |

### Error Logs

```typescript
console.error("Error processing webhook:", {
  error: error.message,
  orderId: extractedData?.order_id,
  contactId: extractedData?.contact_id,
  timestamp: new Date().toISOString(),
});
```

---

## Monitoring Webhook Activity

### Log Webhook Requests

```typescript
// Create custom logger
import { createCustomLogger } from "@/utils/logging/logger";

const logger = createCustomLogger("webhook-qr", "webhooks");

logger.info(`Webhook received: Order ${extractedData.order_id}`);
logger.error(`Webhook failed: ${error.message}`);
```

### Check Logs

```bash
# View webhook logs
tail -f logs/webhooks/webhook-qr-2025-12-31.log
```

---

## Testing

### Manual Webhook Test

```bash
curl -X POST http://localhost:4001/api/ghl/webhook-qr \
  -H "Content-Type: application/json" \
  -d '{
    "type": "OrderCreate",
    "locationId": "location_123",
    "order": {
      "_id": "test_order_123",
      "contactId": "test_contact_456",
      "items": [
        {
          "product": {
            "_id": "test_product_789"
          }
        }
      ]
    }
  }'
```

### Expected Response

```json
{
  "message": "QR code generated, GHL contact updated, and order sync triggered successfully.",
  "qrCodeURL": "https://your-domain.com/orders/test_order_123",
  "qrCodeImage": "data:image/png;base64,iVBORw0...",
  "updateResult": { /* GHL update response */ }
}
```

---

## Webhook Retry Logic

GHL automatically retries failed webhooks:

- **Retry Attempts:** Up to 3 times
- **Retry Interval:** Exponential backoff (1min, 5min, 15min)
- **Failure Threshold:** After 3 failures, webhook is marked as failed

**Recommendation:** Implement idempotency to handle duplicate webhook deliveries.

---

## Related Documentation

- [Data Flow](/docs/architecture/data-flow.md) - Complete webhook flow diagram
- [GHL Integration](/docs/api/ghl-integration.md) - GHL API endpoints
- [QR Code Generation](/docs/features/qr-code-generation.md) - QR code generation details
- [Development Workflow](/docs/guides/development-workflow.md) - Local testing with ngrok

---

**Last Updated:** December 31, 2025

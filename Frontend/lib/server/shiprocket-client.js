import { getShiprocketEnv } from "@/lib/server/env";

let shiprocketToken = null;
let tokenExpiry = 0;

export async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) return shiprocketToken;

  const { email, password, baseUrl } = getShiprocketEnv();
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Failed to authenticate with Shiprocket");

  const data = await res.json();
  shiprocketToken = data.token;
  // Token usually expires in 10 days, cache for 1 day
  tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return shiprocketToken;
}

export async function createShiprocketOrder(orderData) {
  const token = await getShiprocketToken();
  const { baseUrl } = getShiprocketEnv();

  const res = await fetch(`${baseUrl}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Shiprocket Create Order API Error:", errorText);
    throw new Error(`Shiprocket API Error: ${res.statusText}`);
  }

  return res.json();
}

export async function assignAwb(shipmentId) {
  const token = await getShiprocketToken();
  const { baseUrl } = getShiprocketEnv();

  const res = await fetch(`${baseUrl}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Shiprocket Assign AWB API Error:", errorText);
    throw new Error(`Shiprocket API Error: ${res.statusText}`);
  }

  return res.json();
}

export async function requestPickup(shipmentId) {
  const token = await getShiprocketToken();
  const { baseUrl } = getShiprocketEnv();

  const res = await fetch(`${baseUrl}/courier/generate/pickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Shiprocket Request Pickup API Error:", errorText);
    throw new Error(`Shiprocket API Error: ${res.statusText}`);
  }

  return res.json();
}

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

function extractUserData(evt: WebhookEvent & { type: "user.created" | "user.updated" }) {
  const { id, email_addresses = [], username, first_name, last_name, image_url } = evt.data;
  const primaryEmail = email_addresses.find(
    (e: { id: string }) => e.id === evt.data.primary_email_address_id
  );
  const rawEmail = primaryEmail?.email_address ?? "";
  // Test payloads may have empty email; use placeholder to satisfy unique constraint
  const email = rawEmail || `webhook-${id}@placeholder.local`;
  const baseUsername = username ?? (rawEmail ? rawEmail.split("@")[0] : "user");
  const usernameFinal = username ?? `${baseUsername}_${id.replace(/^user_/, "").slice(0, 8)}`;
  const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;
  return { id, email, username: usernameFinal, displayName, avatarUrl: image_url };
}

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("[webhook] CLERK_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[webhook] Missing svix headers");
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("[webhook] Invalid signature:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    if (evt.type === "user.created") {
      const { id, email, username, displayName, avatarUrl } = extractUserData(evt);
      await prisma.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, username, displayName, avatarUrl },
        update: { email, username, displayName, avatarUrl },
      });
    }

      if (evt.type === "user.updated") {
      const { id, email, username, displayName, avatarUrl } = extractUserData(evt);
      await prisma.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, username, displayName, avatarUrl },
        update: { email, username, displayName, avatarUrl },
      });
    }

    if (evt.type === "user.deleted" && evt.data.id) {
      await prisma.user.deleteMany({
        where: { clerkId: evt.data.id },
      });
    }

    return new Response("", { status: 200 });
  } catch (err) {
    console.error("[webhook] Error:", err);
    return new Response(
      `Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/security/auth";
import { HttpError, toErrorResponse } from "@/lib/security/errors";

export async function PATCH(request, { params }) {
  try {
    const { admin } = await requireAdminUser();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await admin
      .from("contact_messages")
      .update({ read: body.read })
      .eq("id", id)
      .select("id, read")
      .single();

    if (error) throw new HttpError(400, error.message);

    return NextResponse.json({ data });
  } catch (error) {
    return toErrorResponse(error, "Failed to update message.");
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin } = await requireAdminUser();
    const { id } = await params;

    const { error } = await admin
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) throw new HttpError(400, error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete message.");
  }
}

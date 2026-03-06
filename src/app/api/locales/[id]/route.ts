import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { visible } = await request.json();
  await pool.query("UPDATE locales SET visible = ? WHERE id = ?", [visible ? 1 : 0, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query("DELETE FROM locales WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

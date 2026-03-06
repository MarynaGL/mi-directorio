import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Row extends RowDataPacket { id: number; nombre: string; }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departamento_id = searchParams.get("departamento_id");
  if (!departamento_id) return NextResponse.json([]);

  const [rows] = await pool.query<Row[]>(
    "SELECT id, nombre FROM localidades WHERE departamento_id = ? ORDER BY nombre",
    [departamento_id]
  );
  return NextResponse.json(rows);
}

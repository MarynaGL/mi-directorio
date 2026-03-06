import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Row extends RowDataPacket { id: number; nombre: string; }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provincia_id = searchParams.get("provincia_id");
  if (!provincia_id) return NextResponse.json([]);

  const [rows] = await pool.query<Row[]>(
    "SELECT id, nombre FROM departamento WHERE provincia_id = ? ORDER BY nombre",
    [provincia_id]
  );
  return NextResponse.json(rows);
}

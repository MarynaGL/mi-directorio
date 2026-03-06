import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Row extends RowDataPacket { id: number; nombre: string; }

export async function GET() {
  const [rows] = await pool.query<Row[]>("SELECT id, nombre FROM rubros ORDER BY nombre");
  return NextResponse.json(rows);
}

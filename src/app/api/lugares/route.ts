import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface LugarRow extends RowDataPacket {
  id: number;
  rubro: string;
  provincia: string;
  localidad: string;
  direccion: string;
  whatsapp: string;
  video_url: string | null;
  visible: number;
  imagenes: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rubro = searchParams.get("rubro");
  const provincia = searchParams.get("provincia");
  const localidad = searchParams.get("localidad");
  const soloVisibles = searchParams.get("admin") !== "true";

  let query = `
    SELECT l.*, GROUP_CONCAT(li.ruta ORDER BY li.id SEPARATOR ',') as imagenes
    FROM lugares l
    LEFT JOIN lugar_imagenes li ON l.id = li.lugar_id
    WHERE 1=1
  `;
  const values: string[] = [];

  if (soloVisibles) query += " AND l.visible = 1";
  if (rubro) { query += " AND l.rubro = ?"; values.push(rubro); }
  if (provincia) { query += " AND l.provincia = ?"; values.push(provincia); }
  if (localidad) { query += " AND l.localidad = ?"; values.push(localidad); }

  query += " GROUP BY l.id ORDER BY l.id DESC";

  const [rows] = await pool.query<LugarRow[]>(query, values);
  const lugares = rows.map((row) => ({
    ...row,
    imagenes: row.imagenes ? row.imagenes.split(",") : [],
    visible: row.visible === 1,
  }));

  return NextResponse.json(lugares);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { rubro, provincia, localidad, direccion, whatsapp, video_url, visible, imagenes } = body;

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO lugares (rubro, provincia, localidad, direccion, whatsapp, video_url, visible) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [rubro, provincia, localidad, direccion, whatsapp, video_url || null, visible ? 1 : 0]
  );

  const lugarId = result.insertId;

  if (imagenes?.length) {
    for (const ruta of imagenes) {
      await pool.query("INSERT INTO lugar_imagenes (lugar_id, ruta) VALUES (?, ?)", [lugarId, ruta]);
    }
  }

  return NextResponse.json({ ok: true, id: lugarId });
}

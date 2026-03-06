import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rubro_id       = searchParams.get("rubro_id");
  const provincia_id   = searchParams.get("provincia_id");
  const departamento_id = searchParams.get("departamento_id");
  const localidad_id   = searchParams.get("localidad_id");
  const texto          = searchParams.get("texto");
  const admin          = searchParams.get("admin") === "true";

  let query = `
    SELECT l.id, l.nombre, l.direccion, l.whatsapp, l.video_url, l.visible,
      l.fecha_desde, l.fecha_hasta, l.tiktok, l.facebook, l.instagram,
      r.nombre   AS rubro,
      loc.nombre AS localidad,
      d.nombre   AS partido,
      p.nombre   AS provincia,
      GROUP_CONCAT(i.path ORDER BY i.id SEPARATOR ',') AS imagenes
    FROM locales l
    JOIN rubros r        ON l.rubro_id        = r.id
    JOIN localidades loc ON l.ciudad_id        = loc.id
    JOIN departamento d  ON loc.departamento_id = d.id
    JOIN provincias p    ON d.provincia_id      = p.id
    LEFT JOIN imagenes i ON l.id = i.local_id
    WHERE 1=1
  `;
  const values: (string | number)[] = [];

  if (!admin) {
    query += " AND l.visible = 1";
    query += " AND (l.fecha_hasta IS NULL OR l.fecha_hasta >= CURDATE())";
  }
  if (rubro_id)        { query += " AND l.rubro_id = ?"; values.push(rubro_id); }
  if (provincia_id)    { query += " AND p.id = ?";       values.push(provincia_id); }
  if (departamento_id) { query += " AND d.id = ?";       values.push(departamento_id); }
  if (localidad_id)    { query += " AND loc.id = ?";     values.push(localidad_id); }
  if (texto) {
    query += " AND (l.nombre LIKE ? OR l.direccion LIKE ?)";
    values.push(`%${texto}%`, `%${texto}%`);
  }

  query += " GROUP BY l.id ORDER BY l.id DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, values);
  const locales = rows.map((row) => ({
    ...row,
    imagenes: row.imagenes ? row.imagenes.split(",") : [],
    visible: row.visible === 1,
  }));

  return NextResponse.json(locales);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    nombre, direccion, whatsapp, video_url,
    tiktok, facebook, instagram,
    fecha_desde, fecha_hasta,
    rubro_id, ciudad_id, visible, imagenes,
  } = body;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO locales
      (nombre, direccion, whatsapp, video_url, tiktok, facebook, instagram,
       fecha_desde, fecha_hasta, rubro_id, ciudad_id, visible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre, direccion, whatsapp,
      video_url || null, tiktok || null, facebook || null, instagram || null,
      fecha_desde || null, fecha_hasta || null,
      rubro_id, ciudad_id, visible ? 1 : 0,
    ]
  );

  const localId = result.insertId;

  if (imagenes?.length) {
    for (const path of imagenes) {
      await pool.query("INSERT INTO imagenes (local_id, path) VALUES (?, ?)", [localId, path]);
    }
  }

  return NextResponse.json({ ok: true, id: localId });
}

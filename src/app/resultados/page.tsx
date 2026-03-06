import Link from "next/link";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import ImagenCarrusel from "./ImagenCarrusel";

interface LocalRow extends RowDataPacket {
  id: number;
  nombre: string;
  direccion: string;
  whatsapp: string;
  video_url: string | null;
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  rubro: string;
  localidad: string;
  partido: string;
  provincia: string;
  imagenes: string | null;
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{
    provincia_id?: string;
    departamento_id?: string;
    localidad_id?: string;
    rubro_id?: string;
    texto?: string;
  }>;
}) {
  const params = await searchParams;
  const { provincia_id, departamento_id, localidad_id, rubro_id, texto } = params;

  let query = `
    SELECT l.id, l.nombre, l.direccion, l.whatsapp, l.video_url,
      l.tiktok, l.facebook, l.instagram,
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
    WHERE l.visible = 1
      AND (l.fecha_hasta IS NULL OR l.fecha_hasta >= CURDATE())
  `;
  const values: (string | number)[] = [];

  if (rubro_id)        { query += " AND l.rubro_id = ?"; values.push(rubro_id); }
  if (provincia_id)    { query += " AND p.id = ?";       values.push(provincia_id); }
  if (departamento_id) { query += " AND d.id = ?";       values.push(departamento_id); }
  if (localidad_id)    { query += " AND loc.id = ?";     values.push(localidad_id); }
  if (texto) {
    query += " AND (l.nombre LIKE ? OR l.direccion LIKE ?)";
    values.push(`%${texto}%`, `%${texto}%`);
  }

  query += " GROUP BY l.id ORDER BY l.id DESC";

  const [rows] = await pool.query<LocalRow[]>(query, values);
  const resultados = rows.map(row => ({
    ...row,
    imagenes: row.imagenes ? row.imagenes.split(",") : [],
  }));

  // --- AQUÍ ESTÁ LA MAGIA DEL SUBTÍTULO ARREGLADA ---
  let resumen = "Lista completa de locales";

  if (resultados.length > 0) {
    // Solo tomamos el nombre del resultado si el usuario usó ese filtro
    const filtrosUsados = [];
    if (rubro_id) filtrosUsados.push(resultados[0].rubro);
    if (provincia_id) filtrosUsados.push(resultados[0].provincia);
    if (departamento_id) filtrosUsados.push(resultados[0].partido);
    if (localidad_id) filtrosUsados.push(resultados[0].localidad);
    if (texto) filtrosUsados.push(`"${texto}"`);

    if (filtrosUsados.length > 0) {
      resumen = filtrosUsados.join(" · ");
    }
  } else {
    // Si no hay resultados pero había filtros
    const tieneFiltros = rubro_id || provincia_id || departamento_id || localidad_id || texto;
    if (tieneFiltros) {
      resumen = texto ? `Sin resultados para "${texto}"` : "Sin resultados para esta búsqueda";
    }
  }
  // ---------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Volver a la búsqueda
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Resultados de búsqueda</h1>
        <p className="text-gray-500 mt-1 text-sm">{resumen}</p>
      </div>

      {resultados.length === 0 && (
        <div className="max-w-5xl mx-auto text-center py-20">
          <p className="text-gray-500 text-lg">No encontramos resultados. Probá con otro rubro o localidad.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Volver a buscar</Link>
        </div>
      )}

      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {resultados.map((local) => (
          <div key={local.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row">

            {/* ── Carrusel de imágenes ── */}
            <ImagenCarrusel imagenes={local.imagenes} alt={local.nombre} />

            {/* ── Contenido ── */}
            <div className="flex flex-col justify-between p-6 flex-1 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {local.rubro}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{local.nombre}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  📍 {local.localidad}, {local.partido}, {local.provincia}
                </p>
                <p className="text-gray-600 text-sm mt-1">{local.direccion}</p>
              </div>

              {/* Video */}
              {local.video_url && (
                <div className="rounded-xl overflow-hidden aspect-video w-full max-w-sm">
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${local.video_url}`}
                    title={`Video de ${local.nombre}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Acciones: WhatsApp + Redes */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/${local.whatsapp}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" className="w-5 h-5">
                    <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.736 5.47 2.018 7.77L0 32l8.454-2.016A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.078 22.344c-.34.955-1.982 1.826-2.713 1.94-.695.108-1.572.153-2.535-.158-.583-.19-1.33-.443-2.285-.868-4.02-1.735-6.644-5.79-6.844-6.06-.2-.27-1.633-2.172-1.633-4.143 0-1.97 1.033-2.94 1.4-3.34.367-.4.8-.5 1.067-.5.267 0 .533.002.767.013.246.012.576-.093.9.688.34.806 1.154 2.778 1.254 2.98.1.2.167.433.033.7-.133.267-.2.433-.4.667-.2.233-.42.52-.6.7-.2.2-.408.416-.175.816.233.4 1.034 1.705 2.218 2.762 1.524 1.356 2.808 1.776 3.208 1.976.4.2.633.167.867-.1.233-.267 1-.1167 1.367-1.534.367-.417.733-.35 1.233-.2.5.15 3.167 1.493 3.7 1.764.534.27.9.4 1.034.633.133.233.133 1.35-.207 2.304z" />
                  </svg>
                  WhatsApp
                </a>

                {local.instagram && (
                  <a href={local.instagram.startsWith("http") ? local.instagram : `https://instagram.com/${local.instagram.replace("@","")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    Instagram
                  </a>
                )}
                {local.facebook && (
                  <a href={local.facebook.startsWith("http") ? local.facebook : `https://facebook.com/${local.facebook.replace("@","")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    Facebook
                  </a>
                )}
                {local.tiktok && (
                  <a href={local.tiktok.startsWith("http") ? local.tiktok : `https://tiktok.com/${local.tiktok.replace("@","")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    TikTok
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
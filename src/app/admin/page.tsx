import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import LugarForm from "./LugarForm";
import ToggleVisible from "./ToggleVisible";

interface LocalRow extends RowDataPacket {
  id: number;
  nombre: string;
  rubro: string;
  provincia: string;
  partido: string;
  localidad: string;
  direccion: string;
  visible: number;
  fecha_desde: string | null;
  fecha_hasta: string | null;
}

function formatFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminPage() {
  const [rows] = await pool.query<LocalRow[]>(`
    SELECT l.id, l.nombre, l.direccion, l.visible, l.fecha_desde, l.fecha_hasta,
      r.nombre   AS rubro,
      p.nombre   AS provincia,
      d.nombre   AS partido,
      loc.nombre AS localidad
    FROM locales l
    JOIN rubros r        ON l.rubro_id        = r.id
    JOIN localidades loc ON l.ciudad_id        = loc.id
    JOIN departamento d  ON loc.departamento_id = d.id
    JOIN provincias p    ON d.provincia_id      = p.id
    ORDER BY l.id DESC
  `);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Ver sitio</Link>
            <a href="/api/admin/logout" className="text-red-500 hover:underline">Cerrar sesión</a>
          </div>
        </div>

        <LugarForm />

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Locales cargados ({rows.length})
          </h2>

          {rows.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay locales. Usá el formulario de arriba para agregar el primero.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-gray-400 text-xs uppercase">
                    <th className="pb-3 pr-4">Nombre</th>
                    <th className="pb-3 pr-4">Rubro</th>
                    <th className="pb-3 pr-4">Provincia</th>
                    <th className="pb-3 pr-4">Partido</th>
                    <th className="pb-3 pr-4">Localidad</th>
                    <th className="pb-3 pr-4">Desde</th>
                    <th className="pb-3 pr-4">Hasta</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((local) => (
                    <tr key={local.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">{local.nombre}</td>
                      <td className="py-3 pr-4 text-gray-600">{local.rubro}</td>
                      <td className="py-3 pr-4 text-gray-600">{local.provincia}</td>
                      <td className="py-3 pr-4 text-gray-600">{local.partido}</td>
                      <td className="py-3 pr-4 text-gray-600">{local.localidad}</td>
                      <td className="py-3 pr-4 text-gray-500">{formatFecha(local.fecha_desde)}</td>
                      <td className="py-3 pr-4 text-gray-500">{formatFecha(local.fecha_hasta)}</td>
                      <td className="py-3">
                        <ToggleVisible id={local.id} visible={local.visible === 1} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

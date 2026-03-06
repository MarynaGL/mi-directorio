import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import BuscadorForm from "./BuscadorForm";

interface Opcion extends RowDataPacket { id: number; nombre: string; }

export default async function Home() {
  const [provincias] = await pool.query<Opcion[]>("SELECT id, nombre FROM provincias ORDER BY nombre");
  const [rubros]     = await pool.query<Opcion[]>("SELECT id, nombre FROM rubros ORDER BY nombre");

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/fondo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1
        className="text-5xl font-bold text-white text-center mb-8 px-4"
        style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
      >
        ¡Encontrá el lugar que buscás!
      </h1>

      <BuscadorForm provincias={provincias} rubros={rubros} />
    </main>
  );
}

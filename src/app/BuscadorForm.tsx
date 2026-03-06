"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Opcion { id: number; nombre: string; }

interface Props {
  provincias: Opcion[];
  rubros: Opcion[];
}

export default function BuscadorForm({ provincias, rubros }: Props) {
  const router = useRouter();

  const [localidades, setLocalidades] = useState<Opcion[]>([]);
  const [ciudades,    setCiudades]    = useState<Opcion[]>([]);

  const [provinciaId, setProvinciaId] = useState("");
  const [localidadId, setLocalidadId] = useState("");
  const [ciudadId,    setCiudadId]    = useState("");
  const [rubroId,     setRubroId]     = useState("");
  const [texto,       setTexto]       = useState("");

  useEffect(() => {
    setLocalidades([]); setLocalidadId("");
    setCiudades([]);    setCiudadId("");
    if (!provinciaId) return;
    fetch(`/api/localidades?provincia_id=${provinciaId}`).then(r => r.json()).then(setLocalidades);
  }, [provinciaId]);

  useEffect(() => {
    setCiudades([]); setCiudadId("");
    if (!localidadId) return;
    fetch(`/api/ciudades?departamento_id=${localidadId}`).then(r => r.json()).then(setCiudades);
  }, [localidadId]);

  function handleBuscar() {
    const params = new URLSearchParams();
    if (provinciaId)  params.set("provincia_id",    provinciaId);
    if (localidadId)  params.set("departamento_id", localidadId);
    if (ciudadId)     params.set("localidad_id",    ciudadId);
    if (rubroId)      params.set("rubro_id",        rubroId);
    if (texto.trim()) params.set("texto",           texto.trim());
    router.push(`/resultados?${params.toString()}`);
  }

  const selectClass = "flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 bg-white";

  return (
    <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 w-full max-w-6xl mx-4">
      <div className="flex flex-wrap items-center gap-3">

        <select value={provinciaId} onChange={e => setProvinciaId(e.target.value)} className={selectClass}>
          <option value="">Provincia</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <select value={localidadId} onChange={e => setLocalidadId(e.target.value)} disabled={!provinciaId} className={selectClass}>
          <option value="">{provinciaId ? "Partido" : "— Partido —"}</option>
          {localidades.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>

        <select value={ciudadId} onChange={e => setCiudadId(e.target.value)} disabled={!localidadId} className={selectClass}>
          <option value="">{localidadId ? "Localidad" : "— Localidad —"}</option>
          {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <select value={rubroId} onChange={e => setRubroId(e.target.value)} className={selectClass}>
          <option value="">Rubro</option>
          {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>

        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="¿Qué buscás?"
          className={selectClass}
          onKeyDown={e => e.key === "Enter" && handleBuscar()}
        />

        <button
          onClick={handleBuscar}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3 rounded-xl transition-colors"
        >
          BUSCAR
        </button>
      </div>
    </div>
  );
}

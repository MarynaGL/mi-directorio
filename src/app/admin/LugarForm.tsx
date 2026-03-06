"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

interface Opcion { id: number; nombre: string; }

export default function LugarForm() {
  const [errorImagenes, setErrorImagenes] = useState("");
  const [errorWhatsapp, setErrorWhatsapp] = useState("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [provincias,  setProvincias]  = useState<Opcion[]>([]);
  const [localidades, setLocalidades] = useState<Opcion[]>([]);
  const [ciudades,    setCiudades]    = useState<Opcion[]>([]);
  const [rubros,      setRubros]      = useState<Opcion[]>([]);

  const [provinciaId,  setProvinciaId]  = useState("");
  const [localidadId,  setLocalidadId]  = useState("");
  const [ciudadId,     setCiudadId]     = useState("");
  const [rubroId,      setRubroId]      = useState("");

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/provincias").then(r => r.json()).then(setProvincias);
    fetch("/api/rubros").then(r => r.json()).then(setRubros);
  }, []);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const files = (data.getAll("imagenes") as File[]).filter(f => f.size > 0);
    let paths: string[] = [];

    if (files.length > 10) {
      setMensaje({ texto: "Podés subir máximo 10 fotos.", error: true });
      setLoading(false);
      return;
    }
    if (files.length > 0) {
      const uploadData = new FormData();
      files.forEach(f => uploadData.append("files", f));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      const uploadJson = await uploadRes.json();
      paths = uploadJson.rutas;
    }

    const local = {
      nombre:      data.get("nombre"),
      direccion:   data.get("direccion"),
      whatsapp:    data.get("whatsapp"),
      video_url:   data.get("video_url")   || null,
      tiktok:      data.get("tiktok")      || null,
      facebook:    data.get("facebook")    || null,
      instagram:   data.get("instagram")   || null,
      fecha_desde: data.get("fecha_desde") || null,
      fecha_hasta: data.get("fecha_hasta") || null,
      rubro_id:    Number(rubroId),
      ciudad_id:   Number(ciudadId),
      visible:     data.get("visible") === "on",
      imagenes:    paths,
    };

    const res = await fetch("/api/locales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    });

    if (res.ok) {
      setMensaje({ texto: "¡Local guardado correctamente!", error: false });
      formRef.current?.reset();
      setProvinciaId(""); setLocalidadId(""); setCiudadId(""); setRubroId("");
      router.refresh();
    } else {
      setMensaje({ texto: "Error al guardar. Revisá que todos los campos estén completos.", error: true });
    }
    setLoading(false);
  }

  const inputClass = "border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Agregar nuevo local</h2>

      {/* ── SECCIÓN 1: UBICACIÓN ── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">📍 Sección 1 — Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Provincia *</label>
            <select value={provinciaId} onChange={e => setProvinciaId(e.target.value)} required className={`${inputClass} bg-white`}>
              <option value="">Seleccioná...</option>
              {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Partido *</label>
            <select value={localidadId} onChange={e => setLocalidadId(e.target.value)} required disabled={!provinciaId} className={`${inputClass} bg-white disabled:bg-gray-100 disabled:text-gray-400`}>
              <option value="">{provinciaId ? "Seleccioná..." : "Primero elegí provincia"}</option>
              {localidades.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Localidad *</label>
            <select value={ciudadId} onChange={e => setCiudadId(e.target.value)} required disabled={!localidadId} className={`${inputClass} bg-white disabled:bg-gray-100 disabled:text-gray-400`}>
              <option value="">{localidadId ? "Seleccioná..." : "Primero elegí partido"}</option>
              {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: DATOS DEL NEGOCIO ── */}
      <div className="rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">🏢 Sección 2 — Datos del Negocio</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Rubro *</label>
            <select value={rubroId} onChange={e => setRubroId(e.target.value)} required className={inputClass}>
              <option value="">Seleccioná un rubro</option>
              {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Nombre del local *</label>
            <input name="nombre" required placeholder="Ej: Hospital Italiano" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Dirección *</label>
            <input name="direccion" required placeholder="Ej: Av. Libertador 1234" className={inputClass} />
          </div>

         <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">WhatsApp (sin letras, espacios ni el signo +) *</label>
          < input 
    name="whatsapp" 
    type="text" 
    placeholder="Ej: 541122334455"
    onChange={(e) => {
      const valor = e.target.value;
      // Esta regla verifica si el valor contiene algo que NO sea un número
      if (/[^0-9]/.test(valor)) {
        setErrorWhatsapp("⚠️ Por favor, ingresá solo números (sin letras, espacios ni el signo +)");
      } else {
        setErrorWhatsapp("");
      }
    }}
    className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {/* Mensaje de error en rojo */}
  {errorWhatsapp && (
    <p className="text-red-500 text-xs mt-1 font-medium italic">
      {errorWhatsapp}
    </p>
  )}
</div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">ID de video YouTube (opcional)</label>
            <input name="video_url" placeholder="Ej: abc123xyz" className={inputClass} />
            <span className="text-xs text-gray-400">Parte final de youtube.com/watch?v=<strong>ESTO</strong></span>
          </div>

          <div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-gray-600">Fotos del local (máximo 10)</label>
  <input 
    name="imagenes" 
    type="file" 
    multiple 
    accept="image/*" 
    onChange={(e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 10) {
        setErrorImagenes("⚠️ Solo podés subir un máximo de 10 fotos. Seleccionaste " + files.length);
        e.target.value = ""; 
      } else {
        setErrorImagenes(""); // Si está todo bien, borramos el mensaje de error
      }
    }}
    className="border rounded-lg px-3 py-2 text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold" 
  />
  {/* El "Cartelito" Rojo debajo del combo */}
  {errorImagenes && (
    <p className="text-red-500 text-xs mt-1 font-medium italic">
      {errorImagenes}
    </p>
  )}
</div>

          {/* Fechas */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Fecha Desde (opcional)</label>
            <input name="fecha_desde" type="date" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Fecha Hasta (opcional)</label>
            <input name="fecha_hasta" type="date" className={inputClass} />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">🌐 Redes Sociales (opcionales)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">TikTok</label>
              <input name="tiktok" placeholder="@usuario o URL" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Facebook</label>
              <input name="facebook" placeholder="@usuario o URL" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Instagram</label>
              <input name="instagram" placeholder="@usuario o URL" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Visible */}
        <div className="flex items-center gap-3 pt-2">
          <input name="visible" type="checkbox" defaultChecked id="visible" className="w-5 h-5 accent-blue-600" />
          <label htmlFor="visible" className="text-sm font-semibold text-gray-600">Visible en el sitio</label>
        </div>
      </div>

      {mensaje && (
        <p className={`text-sm font-semibold rounded-lg px-4 py-3 ${mensaje.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {mensaje.texto}
        </p>
      )}

      <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
        {loading ? "Guardando..." : "GUARDAR LOCAL"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

interface Props {
  imagenes: string[];
  alt: string;
}

export default function ImagenCarrusel({ imagenes, alt }: Props) {
  const [indice, setIndice] = useState(0);

  // Sin imágenes: mostrar placeholder
  if (imagenes.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-300 text-sm flex-shrink-0 md:w-72">
        Sin imagen
      </div>
    );
  }

  const hayVarias = imagenes.length > 1;

  function anterior() {
    setIndice(i => (i === 0 ? imagenes.length - 1 : i - 1));
  }

  function siguiente() {
    setIndice(i => (i === imagenes.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative w-full md:w-72 h-56 flex-shrink-0 bg-gray-100 overflow-hidden group">
      {/* Imagen actual */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagenes[indice]}
        alt={`${alt} — foto ${indice + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Flechas — solo si hay más de 1 imagen */}
      {hayVarias && (
        <>
          {/* Flecha izquierda */}
          <button
            onClick={anterior}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2
                       bg-black/40 hover:bg-black/70 text-white
                       rounded-full w-9 h-9 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       focus:opacity-100"
          >
            ‹
          </button>

          {/* Flecha derecha */}
          <button
            onClick={siguiente}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2
                       bg-black/40 hover:bg-black/70 text-white
                       rounded-full w-9 h-9 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       focus:opacity-100"
          >
            ›
          </button>

          {/* Indicador de puntos */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndice(i)}
                aria-label={`Ir a foto ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  i === indice ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleVisible({ id, visible: initialVisible }: { id: number; visible: boolean }) {
  const [visible, setVisible] = useState(initialVisible);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const newVisible = !visible;
    const res = await fetch(`/api/locales/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: newVisible }),
    });
    if (res.ok) {
      setVisible(newVisible);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
        visible
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {visible ? "✓ Visible" : "✗ Oculto"}
    </button>
  );
}

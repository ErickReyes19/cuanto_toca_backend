"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "login-tasks-toast";

/**
 * Guarda el número de tareas del día para mostrarlo como toast después de la
 * redirección posterior al login (el componente que lo consume es
 * `LoginTasksToast`).
 */
export function saveLoginTasksToast(tareasHoy: number) {
  if (typeof window === "undefined" || tareasHoy <= 0) return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(tareasHoy));
  } catch {
    // sessionStorage puede fallar en modo privado; el toast no es crítico.
  }
}

/**
 * Monta este componente en el layout privado para mostrar el toast pendiente.
 */
export function LoginTasksToast() {
  useEffect(() => {
    let pendientes: string | null = null;

    try {
      pendientes = window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }

    const tareasHoy = Number(pendientes);
    if (!Number.isFinite(tareasHoy) || tareasHoy <= 0) return;

    toast.info(
      tareasHoy === 1
        ? "Tienes 1 tarea programada para hoy."
        : `Tienes ${tareasHoy} tareas programadas para hoy.`
    );
  }, []);

  return null;
}

export default LoginTasksToast;

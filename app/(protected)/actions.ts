"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/auth";

/** Cierra la sesión y devuelve a la pantalla de login. */
export async function cerrarSesion() {
  await signOut();
  redirect("/login");
}

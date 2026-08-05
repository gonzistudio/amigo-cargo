"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Correo o contraseña incorrectos." };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export type CredentialsState = { error: string | null; success: string | null };

export async function updateCredentials(
  _prevState: CredentialsState,
  formData: FormData
): Promise<CredentialsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesión no válida. Vuelve a iniciar sesión.", success: null };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  const updates: { email?: string; password?: string } = {};

  if (email && email !== user.email) {
    updates.email = email;
  }

  if (password || confirmPassword) {
    if (password.length < 8) {
      return { error: "La nueva contraseña debe tener al menos 8 caracteres.", success: null };
    }
    if (password !== confirmPassword) {
      return { error: "Las contraseñas no coinciden.", success: null };
    }
    updates.password = password;
  }

  if (!updates.email && !updates.password) {
    return { error: "No hay cambios para guardar.", success: null };
  }

  const { error } = await supabase.auth.updateUser(updates);
  if (error) return { error: error.message, success: null };

  revalidatePath("/admin/cuenta");

  if (updates.email) {
    return {
      error: null,
      success: "Guardado. Si cambiaste el correo, revisa tu bandeja de entrada para confirmarlo antes de que el cambio tome efecto.",
    };
  }
  return { error: null, success: "Contraseña actualizada correctamente." };
}

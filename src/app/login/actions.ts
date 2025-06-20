"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { z } from "zod/v4";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type LoginInput = {
  error?: string;
  formData?: FormData;
};

export async function login(
  _initialState: unknown,
  formData: FormData,
): Promise<{ error?: string } | void> {
  "use server";
  if (!formData) return;
  const supabase = await createClient();

  const rawData = {
    email: formData?.get("email"),
    password: formData?.get("password"),
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) return { error: result.error.message };

  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}

export type SignupInput = {
  error?: string;
  formData?: FormData;
};

export async function signup(
  _initialState: unknown,
  formData: FormData,
): Promise<{ error?: string } | void> {
  "use server";
  if (!formData) return;
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) return { error: result.error.message };

  const { error } = await supabase.auth.signUp(result.data);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}

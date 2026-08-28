"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUp, checkEmailAvailable } from "./actions";
import { useState, useTransition } from "react";
import Link from "next/link";

const signUpSchema = z
  .object({
    full_name: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm_password: z.string().min(8, "Mínimo 8 caracteres"),
    accepted_privacy: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y la política de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export default function RegistroPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      accepted_privacy: false,
    },
  });

  const handleEmailBlur = async () => {
    const email = getValues("email");
    if (!email || !z.string().email().safeParse(email).success) return;

    const res = await checkEmailAvailable(email);
    if (!res.available) {
      setEmailWarning("Este correo ya está registrado.");
    } else {
      setEmailWarning(null);
    }
  };

  const onSubmit = (data: SignUpValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("accepted_privacy", data.accepted_privacy ? "on" : "off");

    startTransition(async () => {
      const response = await signUp(formData);
      if (response && "error" in response && response.error) {
        setServerError(response.error);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white">
      <h1 className="text-2xl font-bold mb-6 text-gold" style={{ fontFamily: "var(--font-serif)" }}>
        Crear cuenta
      </h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nombre completo</label>
          <input
            {...register("full_name")}
            type="text"
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Correo electrónico</label>
          <input
            {...register("email")}
            type="email"
            onBlur={handleEmailBlur}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          {emailWarning && <p className="text-amber-400 text-xs mt-1">{emailWarning}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Contraseña</label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Confirmar contraseña</label>
          <input
            {...register("confirm_password")}
            type="password"
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
          {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            {...register("accepted_privacy")}
            type="checkbox"
            id="privacy"
            className="mt-1 accent-gold cursor-pointer"
          />
          <label htmlFor="privacy" className="text-xs text-white/60">
            Acepto los términos y la{" "}
            <Link href="/privacidad" className="text-gold underline hover:text-gold-light">
              política de privacidad (Ley 21.719)
            </Link>
          </label>
        </div>
        {errors.accepted_privacy && <p className="text-red-400 text-xs">{errors.accepted_privacy.message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gold text-black font-bold py-2.5 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 mt-4 cursor-pointer text-sm"
        >
          {isPending ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
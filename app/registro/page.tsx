"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUp } from "./actions";
import { useState } from "react";

const signUpSchema = z.object({
  full_name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  accepted_privacy: z.boolean().refine(val => val === true, {
    message: "Debes aceptar la política de privacidad",
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function RegistroPage() {
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      accepted_privacy: false,
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setError(null);
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("accepted_privacy", data.accepted_privacy ? "on" : "off");

    try {
      await signUp(formData);
    } catch (e: any) {
      // Note: redirect() throws an error in Next.js, so we need to handle it or let it propagate
      if (e.message !== "NEXT_REDIRECT") {
         setError("Ocurrió un error inesperado");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-black ">Crear cuenta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">Nombre completo</label>
          <input
            {...register("full_name")}
            type="text"
            className="w-full p-2 border rounded text-black"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full p-2 border rounded text-black"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Contraseña</label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-2 border rounded text-black"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 text-sm">
            <input 
              {...register("accepted_privacy")} 
              type="checkbox" 
              className="mt-1 "
            />
            <span className="text-black">
              He leído y acepto la{" "}
              <a href="/privacidad" target="_blank" className="underline text-blue-600">
                política de privacidad
              </a>
            </span>
          </label>
          {errors.accepted_privacy && <p className="text-red-500 text-xs">{errors.accepted_privacy.message}</p>}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}


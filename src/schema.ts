import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(5, { message: "O nome deve conter pelo menos 5 caracteres" }),
  email: z.string().email({ message: "Email inválido!" }),
  password: z.string().min(6, { message: "A senha deve conter pelo menos 6 caracteres" })
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" })
});
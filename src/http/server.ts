import express, { Request, Response } from "express";
import jsonWebToken from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from "../schema";
import z from "zod";

const app = express();
const jwt = jsonWebToken;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/register", async (req: Request, res: Response) => { 
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const userExists: User | null = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      res.status(400).json({ message: "Já existe um usuário com esse email!" });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      }
    });

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET as string
    );

    res.status(201).json({
      message: "Cadastro realizado com sucesso!",
      token,
      user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return
    }
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor!" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user: User | null = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
       res.status(400).json({ message: "Usuário não encontrado!" });
       return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
       res.status(400).json({ message: "Senha incorreta." });
       return
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET as string
    );

     res.json({
      message: "Login efetuado com sucesso.",
      token,
      user: { id: user.user_id, name: user.name, email: user.email }
    });
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
       return
    }
    console.error(error);
     res.status(500).json({ message: "Erro no servidor." });
     return
  }  
});

app.listen(3333, () => {
  console.log("Server running!");
});

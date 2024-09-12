import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRETKEY: string;
  };
}>();

const SignUpBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

const SignInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type SignInResponse = z.infer<typeof SignInBodySchema>;

type SignUpResponse = z.infer<typeof SignUpBodySchema>;

type signinResponse = (SignUpResponse & { id: string }) | null;

interface env {
  DATABASE_URL: string;
}

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const user: SignUpResponse = SignUpBodySchema.parse(await c.req.json());
  try {
    const res = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    console.log("User created:", res);
    const token = await sign({ userId: res.id }, c.env?.SECRETKEY);
    return c.json({
      message: "User registered successfully!",
      token,
    });
  } catch (error) {
    console.error("Error validating input:", error);
  }
  console.log("User registered:", user);
});

userRouter.post("/signin", async (c) => {
  const body: SignInResponse = SignInBodySchema.parse(await c.req.json());
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  const jwt = await sign({ id: user.id }, c.env.SECRETKEY);
  return c.json({
    jwt,
    message: "User logged in successfully!",
  });
});

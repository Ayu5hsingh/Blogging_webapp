import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { z } from "zod";
import { decode, sign, verify } from "hono/jwt";

// importing middleware
import { messagesMiddleware, blogMiddleware } from "./middleware";
import { extractUserId } from "./middleware";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRETKEY: string;
  };
}>();

app.use('*', extractUserId);


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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/user/signup", async (c) => {
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

app.post("/api/v1/user/signin", async (c) => {
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


app.post("/api/v1/blog", (c) => {
  return c.json({ message: "Blog created successfully!", id: "your_id" });
});

app.put("/api/v1/blog/:id", (c) => {
  return c.json({ message: "Blog updated successfully!" });
});

export default app;

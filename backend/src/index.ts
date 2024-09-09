import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {z} from "zod";
import { useTransition } from "hono/jsx";

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

const SignUpBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8)
})

type UserSchema = z.infer<typeof SignUpBodySchema>;
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
  
  const user: UserSchema = SignUpBodySchema.parse( await c.req.json());
  console.log("User registered:", user);
  return c.text("User registered successfully!");
});

app.post("/api/v1/user/signin", (c) => {
  return c.json({
    message: "User logged in successfully!",
    token: "your_token",
  });
});

app.post("/api/v1/blog", (c) => {
  return c.json({ message: "Blog created successfully!", id: "your_id" });
});

app.put("/api/v1/blog/:id", (c) => {
  return c.json({ message: "Blog updated successfully!" });
});

export default app;

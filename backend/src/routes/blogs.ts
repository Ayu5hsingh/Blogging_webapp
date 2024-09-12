import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { extractUserId } from '../middleware';

type Variables = {
  userId: string;
};

const blogSchema = z.object({
  title: z.string().min(5).max(50),
  content: z.string().min(10),
});

type blogResponse = z.infer<typeof blogSchema>

export const blogRouter = new Hono<{
  Variables: Variables;
  Bindings: {
    DATABASE_URL: string;
    SECRETKEY: string;
  };
}>();

blogRouter.use(extractUserId)

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  console.log(userId);

  const body = await c.req.json()
  const result  = blogSchema.safeParse(body)
  if (!result.success) {
    return c.json({
        error: "Invaid Input validation failed"
      });
    }
  const {title, content}: blogResponse = result.data;
  const response = await prisma.post.create({
    data: {
      title,
      content,
      authorId: userId 
    },
  })
  return c.json(userId);
});

blogRouter.put("/:id", (c) => {
  return c.json({ message: "Blog updated successfully!" });
});

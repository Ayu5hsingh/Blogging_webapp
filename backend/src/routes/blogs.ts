import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";

type Variables = {
  userId: string;
};

export const blogRouter = new Hono<{
  Variables: Variables;
  Bindings: {
    DATABASE_URL: string;
    SECRETKEY: string;
  };
}>();

blogRouter.post("/", (c) => {
  const userId = c.get("userId");
  console.log(userId);
  return c.json({ message: "Blog created successfully!", id: userId });
});

blogRouter.put("/:id", (c) => {
  return c.json({ message: "Blog updated successfully!" });
});

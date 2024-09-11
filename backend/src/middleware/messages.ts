import { Hono } from "hono";

const app = new Hono();

const messagesMiddleware = app.use("/message/*", async (c, next) => {
  await next();
});


export default {messagesMiddleware}
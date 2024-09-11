import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

const app = new Hono();
const blogMiddleware = createMiddleware( async (c,next) => {
    next();
})

export default {blogMiddleware};
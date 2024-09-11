import { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

const extractUserId: MiddlewareHandler = async (c, next) => {
  try {
    const jwt = c.req.header("Authorization");
    if (!jwt) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    const token = jwt.split(" ")[1];
    const payload: JWTPayload = await verify(token, c.env.SECRETKEY);
    if (!payload) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    const userId = payload.id;
    c.set("userId", userId);
    await next();
  } catch (error) {
    c.json({ error: "Invalid request body" });
  }
};

export default extractUserId;

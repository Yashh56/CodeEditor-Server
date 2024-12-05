import { createClient } from "redis";

export const client = createClient({
  password: process.env.PASSWORD,

  socket: {
    host: process.env.HOST,
    port: process.env.REDISPORT ? parseInt(process.env.REDISPORT) : undefined,
  },
});

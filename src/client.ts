import { createClient } from "redis";
import dotenv from 'dotenv'
dotenv.config()
export const client = createClient({
  password: process.env.PASSWORD,

  socket: {
    host: process.env.HOST,
    port: process.env.REDISPORT ? parseInt(process.env.REDISPORT) : undefined,
  },
});

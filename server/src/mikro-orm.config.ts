import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import dotenv from "dotenv";
import { User } from "./entities/User";

dotenv.config();

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
  entities: [Post, User],
  dbName: "lireddit",
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  debug: !__prod__,
  type: "postgresql",
  // allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];

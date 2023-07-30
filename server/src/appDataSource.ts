import "dotenv-safe/config";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import path from "path";

export const appDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: true,
  entities: [User, Post, Updoot],
  subscribers: [],
  migrations: [path.join(__dirname, "./migrations/*")],
});

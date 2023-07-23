import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

export const appDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: true,
  logging: true,
  entities: [User, Post, Updoot],
  subscribers: [],
  migrations: [path.join(__dirname, "./migrations/*")],
});

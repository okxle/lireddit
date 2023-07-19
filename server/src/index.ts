import "reflect-metadata";
import { __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import { MyContext } from "./types";
import cors from "cors";

import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const appDataSource = new DataSource({
    type: "postgres",
    port: 5432,
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: true,
    entities: [User, Post],
    subscribers: [],
    migrations: [],
  });

  await appDataSource.initialize().catch((error) => console.log(error));

  const app = express();
  // app.set("trust proxy", true);
  // app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
  // app.set("Access-Control-Allow-Credentials", true);
  app.use(
    cors({
      origin: "http://localhost:3000",
      // origin: "https://studio.apollographql.com",
      credentials: true,
    })
  );

  const redisClient = new Redis();
  const redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });
  app.use(
    session({
      name: "qid",
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: "keyboard cat",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true, // prevent front end to access
        secure: __prod__, // cookie only works in https
        sameSite: "lax", // csrf
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis: redisClient }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started in localhost 4000");
  });
};

main();

import "reflect-metadata";
import "dotenv-safe/config";
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
import { appDataSource } from "./appDataSource";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const isApolloSandBoxMode = false; // toggle this so can use in sandbox

const main = async () => {
  await appDataSource.initialize().catch((error) => console.log(error));

  const app = express();

  let corsOrigin = process.env.CORS_ORIGIN;
  let cookieSecure = __prod__;
  let cookieSameSite: "lax" | "none" = "lax";
  if (isApolloSandBoxMode) {
    corsOrigin = "https://studio.apollographql.com";
    cookieSecure = true;
    cookieSameSite = "none";
    app.set("trust proxy", true);
    app.set("Access-Control-Allow-Origin", corsOrigin);
    app.set("Access-Control-Allow-Credentials", true);
  }

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  const redisClient = new Redis(process.env.REDIS_URL);
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
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true, // prevent front end to access
        secure: cookieSecure, // cookie only works in https
        sameSite: cookieSameSite, // csrf
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis: redisClient,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT), () => {
    console.log("server started in localhost 4000");
  });
};

main();

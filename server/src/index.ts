import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import { MyContext } from "./types";
import cors from "cors";


const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const emFork = orm.em.fork();

  const app = express();
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));

  const redisClient = createClient();
  redisClient.connect().catch(console.error);
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
    context: ({ req, res }): MyContext => ({ em: emFork, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started in localhost 4000");
  });
};

main();

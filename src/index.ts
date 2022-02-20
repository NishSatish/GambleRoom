import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BetsResolver } from "./resolvers/bets";
import { EventsResolver } from "./resolvers/events";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginCacheControl,
} from "apollo-server-core";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
(async () => {
  const schema = await buildSchema({
    resolvers: [BetsResolver, EventsResolver],
    validate: false,
  });
  const app = express();
  const httpServer = createServer(app);
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );
  const apolloServer = new ApolloServer({
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginCacheControlDisabled(),
      ApolloServerPluginCacheControl({ calculateHttpHeaders: false }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
    schema,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  httpServer.listen(4000, () => {
    console.log("Server has started");
  });
})();

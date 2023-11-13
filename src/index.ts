import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { connectDataSource } from "./config/db";

import { BetsResolver } from "./resolvers/bets";
import { EventsResolver } from "./resolvers/events";
import { UserResolver } from "./resolvers/users";


(async () => {
  // DATABASE CONNECTION
  connectDataSource();

  const schema = await buildSchema({
    resolvers: [BetsResolver, EventsResolver, UserResolver],
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

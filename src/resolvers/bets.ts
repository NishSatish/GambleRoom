import {
  Arg,
  Float,
  Mutation,
  Resolver,
  PubSub,
  PubSubEngine,
  Query,
} from "type-graphql";

import { Bet } from "../entities/Bet";
import { events, bets } from "./db";

@Resolver()
export class BetsResolver {
  @Query(() => [Bet])
  async getBets() {
    return bets;
  }

  @Mutation(() => Float)
  async addMyBet(
    @Arg("betValue") bet: number,
    @Arg("userId") user: string,
    @Arg("eventId") event: string,
    @Arg("pool") pool: "A" | "B",
    @PubSub() pubsub: PubSubEngine
  ) {
    const eventToBet = events.find((eve) => eve.id === event);
    if (!eventToBet) {
      throw new Error("Event not found");
    }
    const betBelongsToUser = bets.find(
      (bet) => bet.betPlacer === user && bet.eventId === event
    );

    // Same guy bets again
    if (betBelongsToUser) {
      betBelongsToUser.totalBet += bet;
      betBelongsToUser.pool === "A"
        ? (eventToBet.Apool += bet)
        : (eventToBet.Bpool += bet);
      pubsub.publish("EventChanges", {});
      const myBetPercent =
        (betBelongsToUser.totalBet /
          (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
        100;
      return myBetPercent;
    }

    // New guy bets
    const newBet = new Bet(pool, bet, user, event);
    bets.push(newBet);
    newBet.pool === "A"
      ? (eventToBet.Apool += newBet.initAmount)
      : (eventToBet.Bpool += newBet.initAmount);
    pubsub.publish("EventChanges", {});
    newBet.totalBet += newBet.initAmount;
    const myBetPercent =
      (newBet.totalBet / (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
      100;
    return myBetPercent;
  }
}

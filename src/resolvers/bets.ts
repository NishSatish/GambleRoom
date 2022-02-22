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
import { events, bets, users } from "./db";

@Resolver()
export class BetsResolver {
  @Query(() => [Bet])
  async getBets() {
    return bets;
  }

  @Mutation(() => Float)
  async addMyBet(
    @Arg("betValue") bet: number,
    @Arg("userId") userId: string,
    @Arg("eventId") event: string,
    @Arg("pool") pool: "A" | "B",
    @PubSub() pubsub: PubSubEngine
  ) {
    const eventToBet = events.find((eve) => eve.id === event);
    const user = users.find((user) => user.id === userId)!;
    if (!eventToBet) {
      throw new Error("Event not found");
    }
    const betBelongsToUser = bets.find(
      (bet) => bet.betPlacer === userId && bet.eventId === event
    );

    // Same guy bets again
    if (betBelongsToUser) {
      betBelongsToUser.totalBet += bet;
      user.bank -= bet;
      betBelongsToUser.pool === "A"
        ? (eventToBet.Apool += bet)
        : (eventToBet.Bpool += bet);
      pubsub.publish("EventChanges", {});
      const myBetPercent =
        (betBelongsToUser.totalBet /
          (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
        100;
      betBelongsToUser.betPercent = myBetPercent;
      return myBetPercent;
    }

    // New guy bets
    const newBet = new Bet(pool, bet, userId, event);
    user.bank -= bet;
    bets.push(newBet);
    newBet.pool === "A"
      ? (eventToBet.Apool += newBet.initAmount)
      : (eventToBet.Bpool += newBet.initAmount);
    pubsub.publish("EventChanges", {});
    newBet.totalBet += newBet.initAmount;
    const myBetPercent =
      (newBet.totalBet / (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
      100;
    newBet.betPercent = myBetPercent;
    return myBetPercent;
  }
}

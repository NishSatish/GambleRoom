import {
  Arg,
  Float,
  Mutation,
  Resolver,
  PubSub,
  PubSubEngine,
  Query,
  Subscription,
} from "type-graphql";

import { Bet } from "../entities/Bet";
import { events, bets, users } from "../config/db";

@Resolver()
export class BetsResolver {
  private betsToReturn: Bet[] = [];

  recalculateBetPercents(apool: number, bpool: number) {
    this.betsToReturn = bets.map((bet) => {
      bet.betPercent =
        (bet.totalBet / (bet.pool === "A" ? apool : bpool)) * 100;
      return bet;
    });
  }

  @Query(() => [Bet])
  async getBets() {
    return this.betsToReturn;
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
    const user = users.find((user) => user.id === userId);
    if (!eventToBet || !user) {
      throw new Error("Event/User not found");
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

      this.recalculateBetPercents(eventToBet.Apool, eventToBet.Bpool);

      pubsub.publish("MyBetPercentChanges", {});
      return myBetPercent;
    }

    // New guy bets
    const newBet = new Bet(pool, bet, userId, event);
    user.bank -= bet;
    bets.push(newBet);
    newBet.pool === "A"
      ? (eventToBet.Apool += newBet.initAmount)
      : (eventToBet.Bpool += newBet.initAmount);

    newBet.totalBet += newBet.initAmount;

    const myBetPercent =
      (newBet.totalBet / (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
      100;
    newBet.betPercent = myBetPercent;

    this.recalculateBetPercents(eventToBet.Apool, eventToBet.Bpool);

    pubsub.publish("EventChanges", {});
    pubsub.publish("MyBetPercentChanges", {});

    return myBetPercent;
  }

  @Subscription(() => Float, {
    topics: "MyBetPercentChanges",
  })
  async getMyBetPercent(@Arg("betPlacer") betPlacer: string) {
    const bet = bets.find((bet) => betPlacer === bet.betPlacer);
    if (!bet) {
      throw new Error("User's bet not found");
    }

    return bet.betPercent;
  }
}

import { Arg, Float, Mutation, Query, Resolver } from "type-graphql";

import { Bet, Event, EventInput } from "../src/types";

@Resolver()
export class BetsResolver {
  private events: Event[] = [];
  private bets: Bet[] = [];

  @Query(() => [Event])
  async getEvent() {
    return this.events;
  }

  @Mutation(() => Event)
  async createEvent(
    @Arg("eventInput") { predictionA, predictionB, title }: EventInput
  ) {
    const event = new Event(predictionA, predictionB, title);

    this.events.push(event);

    return event;
  }

  @Mutation(() => Float)
  async addMyBet(
    @Arg("betValue") bet: number,
    @Arg("userId") user: string,
    @Arg("eventId") event: string,
    @Arg("pool") pool: string
  ) {
    const eventToBet = this.events.find((eve) => eve.id === event)!;
    const betBelongsToUser = this.bets.find(
      (bet) => bet.betPlacer === user && bet.eventId === event
    );

    // Same guy bets again
    if (betBelongsToUser) {
      betBelongsToUser.totalBet += bet;
      betBelongsToUser.pool === "A"
        ? (eventToBet.Apool += bet)
        : (eventToBet.Bpool += bet);
      const myBetPercent =
        betBelongsToUser.totalBet /
        (pool === "A" ? eventToBet.Apool : eventToBet.Bpool);
      return myBetPercent;
    }

    // New guy bets
    const newBet = new Bet(pool, bet, user, event);
    this.bets.push(newBet);
    newBet.pool === "A"
      ? (eventToBet.Apool += newBet.initAmount)
      : (eventToBet.Bpool += newBet.initAmount);
    newBet.totalBet += newBet.initAmount;
    const myBetPercent =
      (newBet.totalBet / (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
      100;
    return myBetPercent;
  }

  @Query(() => [Bet])
  getBets() {
    return this.bets;
  }
}

import {
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Subscription,
} from "type-graphql";
import { bets, events } from "./db";
import { Event } from "../entities/Event";
import { EventInput } from "../entities/types";

@Resolver()
export class EventsResolver {
  @Subscription(() => [Event], {
    topics: "EventChanges",
  })
  async getEvents() {
    return events;
  }

  @Mutation(() => Event)
  async createEvent(
    @Arg("eventInput") { predictionA, predictionB, title }: EventInput,
    @PubSub() pubsub: PubSubEngine
  ) {
    const event = new Event(predictionA, predictionB, title);

    events.push(event);
    pubsub.publish("EventChanges", {});

    return event;
  }

  @Mutation(() => Event, { nullable: true })
  async setEventStatus(
    @Arg("event") eventId: string,
    @Arg("winningPool") winningPool: "A" | "B",
    @PubSub() pubsub: PubSubEngine
  ) {
    const event = events.find((event) => event.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    event.winningPool = winningPool;
    event.status = "ENDED";
    pubsub.publish("EventChanges", {});
  }

  @Query(() => Event)
  async getWinner(@Arg("eventId") eventId: string) {
    const event = events.find((event) => event.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.status !== "ENDED") {
      throw new Error("Event is still going on!");
    }
    const winningBets =
      event.winningPool === "A"
        ? bets.filter((bet) => bet.pool === "A")
        : bets.filter((bet) => bet.pool === "B");
  }
}

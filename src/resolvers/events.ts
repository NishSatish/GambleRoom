import {
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Subscription,
} from "type-graphql";
import { dataManager, dataSource } from "../config/db";
import { Event } from "../entities/Event";
import { EventInput } from "../entities/types";
import { Bet } from "../entities/Bet";
import { User } from "../entities/User";
import { ObjectId } from "mongodb";

@Resolver()
export class EventsResolver {
  @Subscription(() => [Event], {
    topics: "EventChanges",
  })
  async getEvents() {
    const events = await dataManager.find(Event);
    
    return events;
  }

  @Mutation(() => Event)
  async createEvent(
    @Arg("eventInput") { predictionA, predictionB, title, creator }: EventInput,
    @PubSub() pubsub: PubSubEngine
  ) {
    
    try {
      const user = await dataSource.getMongoRepository(User).findOneBy({
        _id: new ObjectId(creator)
      });
      if (!user) {
        throw new Error('User not found');
      }
      const event = new Event(predictionA, predictionB, title, user);
      await dataManager.save(event);
      pubsub.publish("EventChanges", {});
  
      return event;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @Mutation(() => Event, { nullable: true })
  async setEventStatus(
    @Arg("event") eventId: string,
    @Arg("winningPool") winningPool: "A" | "B",
    @PubSub() pubsub: PubSubEngine
  ) {
    // const event = events.find((event) => event.id === eventId);
    const event = await dataManager.findOneBy(Event, {
      _id: new ObjectId(eventId)
    });
    if (!event) {
      throw new Error("Event not found");
    }

    event.winningPool = winningPool;
    event.status = "ENDED";
    pubsub.publish("EventChanges", {});
    await dataManager.save(event);
  }

  @Query(() => [Bet])
  async creditWinners(@Arg("eventId") eventId: string) {
    try {
      // const event = events.find((event) => event.id === eventId);
    const event = await dataManager.findOneBy(Event, {
      _id: new ObjectId(eventId)
    });
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.status !== "ENDED") {
      throw new Error("Event is still going on!");
    }
    const eventBets = await dataManager.findBy(Bet, {
      event
    });
    const winningBets =
      event.winningPool === "A"
        ? eventBets.filter((bet) => bet.pool === "A")
        : eventBets.filter((bet) => bet.pool === "B");

    // Populate betPlacer field    
    // winningBets.forEach(bet => {
    //   const betPlacer = users.find(user => user.id === bet.betPlacer)!;
    //   if (bet.pool === "A") {
    //     betPlacer.bank += bet.totalBet + (bet.betPercent * event.Apool / 100);
    //   } else {
    //     betPlacer.bank += bet.totalBet + (bet.betPercent * event.Apool / 100);
    //   }
    // });
    for (const bet of winningBets) {
      const betPlacer = await dataManager.findOneBy(User, {
        _id: bet.betPlacer._id
      });
      if (bet.pool === "A") {
        betPlacer!.bank += bet.totalBet + (bet.betPercent * event.Apool / 100);
      } else {
        betPlacer!.bank += bet.totalBet + (bet.betPercent * event.Bpool / 100);
      }
      await dataManager.update(User, {_id: betPlacer!._id}, betPlacer!);
    }

    return winningBets;
    } catch (error) {
      console.log(error);
      return;
    }
    
  }
}

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
import { Event } from "../entities/Event";
import { dataManager, dataSource } from "../config/db";
import { ObjectId } from "mongodb";
import { User } from "../entities/User";

@Resolver()
export class BetsResolver {
  private betsToReturn: Bet[] = [];

  async recalculateBetPercents(event: Event) {
    const bets = await dataSource.getMongoRepository(Bet).find({
      where: {
        'event._id': {
          $eq: event._id
        }
      }
    });
    
    // this.betsToReturn = bets.map((bet) => {
    //   bet.betPercent =
    //     (bet.totalBet / (bet.pool === "A" ? event.Apool : event.Bpool)) * 100;
    //   return bet;
    // });
    const bulkOperations = bets.map((bet) => {
      const poolValue = bet.pool === "A" ? event.Apool : event.Bpool;
      const betPercent = (bet.totalBet / poolValue) * 100;
      return {
          updateOne: {
              filter: { _id: bet._id },
              update: { $set: { betPercent: betPercent } } 
          }
      };
    });
    await dataSource.getMongoRepository(Bet).bulkWrite(bulkOperations);
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
    try {
      const eventToBet = await dataManager.findOneBy(Event, {
        _id: new ObjectId(event)
      });
      console.log("Event", eventToBet);
      
      const user = await dataManager.findOneBy(User, {
        _id: new ObjectId(userId)
      });
      console.log("User", user);
      
      if (!eventToBet || !user) {
        throw new Error("Event/User not found");
      }

      const betBelongsToUser = await dataSource.getMongoRepository(Bet).findOne({
        where: {
          'betPlacer._id': {
            $eq: user._id
          },
          'event._id': {
            $eq: eventToBet._id
          },
        }
      });
      console.log("Bettings", betBelongsToUser);
      
  
      // Same guy bets again
      if (betBelongsToUser) {
        betBelongsToUser.totalBet += bet;
        user.bank -= bet;
        betBelongsToUser.pool === "A"
          ? (eventToBet.Apool += bet)
          : (eventToBet.Bpool += bet);
        pubsub.publish("EventChanges", {});

        // Recalculate weightage of user's Bet in the pool
        const myBetPercent =
          (betBelongsToUser.totalBet /
            (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
          100;
        betBelongsToUser.betPercent = myBetPercent;
  
        // Recalculate new weightages of other bets in the Event pool
        this.recalculateBetPercents(eventToBet);  
        pubsub.publish("MyBetPercentChanges", {});

        await dataSource.getMongoRepository(Bet).findOneAndUpdate({_id: betBelongsToUser._id}, { $set: { totalBet: betBelongsToUser.totalBet, betPercent: betBelongsToUser.betPercent } });
        await dataSource.getMongoRepository(User).findOneAndUpdate({_id: user._id}, { $set: { bank: user.bank } });
        await dataSource.getMongoRepository(Event).findOneAndUpdate({_id: eventToBet._id}, { $set: { Apool: eventToBet.Apool, Bpool: eventToBet.Bpool } });
        return myBetPercent;
      }
  
      // New guy bets
      const newBet = new Bet(pool, bet, user, eventToBet);
      user.bank -= bet;
      // bets.push(newBet);
      newBet.pool === "A"
      ? (eventToBet.Apool += newBet.initAmount)
      : (eventToBet.Bpool += newBet.initAmount);
      
      newBet.totalBet += newBet.initAmount;
      
      const myBetPercent =
      (newBet.totalBet / (pool === "A" ? eventToBet.Apool : eventToBet.Bpool)) *
      100;
      newBet.betPercent = myBetPercent;
      await dataManager.save(newBet);
      
      this.recalculateBetPercents(eventToBet);
      
      pubsub.publish("EventChanges", {});
      pubsub.publish("MyBetPercentChanges", {});
      
      await dataSource.getMongoRepository(User).findOneAndUpdate({_id: user._id}, { $set: { bank: user.bank } });
      await dataSource.getMongoRepository(Event).findOneAndUpdate({_id: eventToBet._id}, { $set: { Apool: eventToBet.Apool, Bpool: eventToBet.Bpool } });
      return myBetPercent;      
    } catch (error) {
      console.log(error);
      return "error logged"
    }
  }

  @Subscription(() => Float, {
    topics: "MyBetPercentChanges",
  })
  async getMyBetPercent(@Arg("betPlacer") betPlacer: string) {
    try {
    const user = await dataManager.findOneBy(User, {
      _id: new ObjectId(betPlacer)
    }); 
    if (!user) {
      throw new Error('User not found');
    }
    const bet = await dataSource.getMongoRepository(Bet).findOne({
      where: {
        'betPlacer._id': {
          $eq: user._id
        }
      }
    });
    if (!bet) {
      throw new Error("User's bet not found");
    }

    return bet.betPercent;
    } catch (error) {
      console.log(error);
      return "error logged";
    }   
  }
}

import { Field, ID, InputType, ObjectType } from "type-graphql";

// @Field is for type-graphql, and other decorators is for TypeORm
@ObjectType()
export class Event {
  constructor(predA: string, predB: string, title: string) {
    this.predictionA = predA;
    this.predictionB = predB;
    this.eventTitle = title;
    this.id = Math.random().toString();
  }

  @Field(() => ID)
  id: string;

  @Field()
  Apool: number = 0.0;

  @Field()
  Bpool: number = 0.0;

  @Field()
  eventTitle: string;

  @Field(() => String)
  predictionA: string;

  @Field(() => String)
  predictionB: string;

  @Field()
  status: "STARTED" | "ENDED" = "STARTED";
}

@ObjectType()
export class Bet {
  constructor(
    pool: "A" | "B",
    amount: number,
    userId: string,
    eventId: string
  ) {
    this.betPlacer = userId;
    this.pool = pool;
    this.initAmount = amount;
    this.eventId = eventId;
    this.totalBet = 0;
    this.id = Math.random().toString();
  }

  @Field(() => ID)
  id: string;

  @Field(() => ID)
  betPlacer?: string;

  @Field(() => ID)
  eventId?: string;

  @Field(() => String)
  pool: string;

  @Field()
  initAmount: number = 0;

  @Field()
  totalBet: number;
}

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  username: string;
}

@InputType()
export class EventInput {
  @Field()
  predictionA: string;

  @Field()
  predictionB: string;

  @Field()
  title: string;
}

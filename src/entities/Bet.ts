import { ObjectType, Field, ID } from "type-graphql";

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
  pool: "A" | "B";

  @Field()
  initAmount: number = 0;

  @Field()
  totalBet: number;

  @Field()
  betPercent: number;
}

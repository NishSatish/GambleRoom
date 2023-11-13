import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Column, ObjectIdColumn } from "typeorm";

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

  @ObjectIdColumn()
  id: string;

  @Column()
  @Field(() => String)
  betPlacer?: string | User;

  @Column()
  @Field(() => ID)
  eventId?: string;

  @Column()
  @Field(() => String)
  pool: "A" | "B";

  @Column()
  @Field()
  initAmount: number = 0;

  @Column()
  @Field()
  totalBet: number;

  @Column()
  @Field()
  betPercent: number;
}

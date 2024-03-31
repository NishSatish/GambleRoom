import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Event } from "./Event";
import { Column, Entity, ObjectIdColumn, ObjectId as TO_ObjectId } from "typeorm";

@Entity()
@ObjectType()
export class Bet {
  constructor(
    pool: "A" | "B",
    amount: number,
    user: User,
    event: Event
  ) {
    this.pool = pool;
    this.initAmount = amount;
    this.totalBet = 0;
    this.betPlacer = user;
    this.event = event;
  }

  @ObjectIdColumn()
  @Field(() => ID)
  _id: TO_ObjectId;

  @Column((_) => User)
  @Field()
  betPlacer: User;

  @Column((_) => Event)
  @Field()
  event: Event;

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

import { ObjectType, Field, ID } from "type-graphql";
import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { User } from "./User";

// @Field is for type-graphql, and other decorators is for TypeORM
@Entity()
@ObjectType()
export class Event {
  constructor(predA: string, predB: string, title: string, creator: User) {
    this.predictionA = predA;
    this.predictionB = predB;
    this.eventTitle = title;
    this.creator = creator;
  }

  @ObjectIdColumn()
  @Field(() => ID)
  _id: ObjectId;

  @Column((_) => User)
  @Field()
  creator: User;

  @Column()
  @Field()
  Apool: number = 0.0;

  @Column()
  @Field()
  Bpool: number = 0.0;

  @Column()
  @Field()
  eventTitle: string;

  @Column()
  @Field(() => String)
  predictionA: string;

  @Column()
  @Field(() => String)
  predictionB: string;

  @Column()
  @Field()
  status: "STARTED" | "ENDED" = "STARTED";

  @Column()
  @Field()
  winningPool: "A" | "B" | "" = "";
}

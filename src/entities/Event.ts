import { ObjectType, Field } from "type-graphql";
import { Column, ObjectIdColumn } from "typeorm";

// @Field is for type-graphql, and other decorators is for TypeORM
@ObjectType()
export class Event {
  constructor(predA: string, predB: string, title: string) {
    this.predictionA = predA;
    this.predictionB = predB;
    this.eventTitle = title;
    this.id = Math.random().toString();
  }

  @ObjectIdColumn()
  id: string;

  @Column()
  @Field()
  creator: string;

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

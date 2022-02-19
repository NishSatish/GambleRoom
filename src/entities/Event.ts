import { ObjectType, Field, ID } from "type-graphql";

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

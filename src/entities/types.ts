import { Field, InputType } from "type-graphql";

@InputType()
export class EventInput {
  @Field()
  predictionA: string;

  @Field()
  predictionB: string;

  @Field()
  title: string;
}

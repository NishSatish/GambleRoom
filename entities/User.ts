import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  username: string;
}

import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class User {
  constructor(un: string, amt: number) {
    this.username = un;
    this.bank = amt;
    this.id = Math.random().toString();
  }
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  bank: number;
}

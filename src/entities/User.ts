import { ObjectType, Field } from "type-graphql";
import { ObjectIdColumn, Entity, Column, ObjectId} from "typeorm";

@Entity()
@ObjectType()
export class User {
  constructor(un: string, amt: number) {
    this.username = un;
    this.bank = amt;
  }

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Field()
  username: string;

  @Column()
  @Field()
  bank: number;
}

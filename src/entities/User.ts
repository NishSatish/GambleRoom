import { ObjectType, Field } from "type-graphql";
import { ObjectIdColumn, Entity, Column} from "typeorm";

@Entity()
@ObjectType()
export class User {
  constructor(un: string, amt: number) {
    this.username = un;
    this.bank = amt;
    this.id = Math.random().toString();
  }

  @ObjectIdColumn()
  id: string;

  @Column()
  @Field()
  username: string;

  @Column()
  @Field()
  bank: number;
}

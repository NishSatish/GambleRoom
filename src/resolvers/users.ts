import { User } from "../entities/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { users } from "./db";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(@Arg("username") uname: string, @Arg("amount") amt: number) {
    const user = new User(uname, amt);
    users.push(user);

    return user;
  }

  @Query(() => [User])
  async getUsers() {
    return users;
  }
}

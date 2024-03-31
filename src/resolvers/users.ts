import { User } from "../entities/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { dataManager } from "../config/db";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(@Arg("username") uname: string, @Arg("amount") amt: number) {
    const user = new User(uname, amt);
    
    try {
      await dataManager.save(user);      
    } catch (error) {
      throw error;
    }

    return user;
  }

  @Query(() => [User])
  async getUsers() {
    const users = await dataManager.find(User);
    
    return users;
  }
}

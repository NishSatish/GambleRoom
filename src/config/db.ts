// TEMPORARY FILE TO STORE DATA
import { Event } from "../entities/Event";
import { Bet } from "../entities/Bet";
import { User } from "src/entities/User";
import { DataSource } from "typeorm";

import 'dotenv/config'

let events: Event[] = [];
let bets: Bet[] = [];
let users: User[] = [];

export const dataSource = new DataSource({
  type: "mongodb",
  url: process.env.DATABASE_URL,
  useNewUrlParser: true,
  entities: [__dirname + '/../entities/*.{js,ts}']
});

export const dataManager = dataSource.manager;

export const connectDataSource = () => {

  return dataSource
    .initialize()
    .then(_ => {
      console.log("DB connected");
    })
    .catch(e => {
      throw e;
    });
}

export { events, bets, users };

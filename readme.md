# GambleRoom

A live gambling-room simulation with web sockets and JS.
A creator hosts an event, and people join in and bet on the odds of the outcomes of the event.

## Tech Stack

- Backend

  - Node (TS) + Express
  - GraphQL (TypeGraphQL)
  - TypeORM
  - Postgres
  - GraphQL Subscriptions (for ws connections)

- Frontend
  - React
  - URQL (To consume the GraphQL API)

## How the math works

The calculation for individual wagers won by a participant is inspired by the popular 'Predictions' feature in Twitch. The math behind their calculation was demystified by a Reddit user
<img width="706" alt="Screenshot 2022-01-28 at 6 30 00 PM" src="https://user-images.githubusercontent.com/34805919/153216670-bde42cfe-715c-4edd-96ed-f92a479349d0.png">

This work on this project is still in the initial stages, stay tuned for more!

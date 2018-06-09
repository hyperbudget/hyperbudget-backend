# hyperbudget

A budget helper. See also [hyperbudget-core](https://github.com/hyperbudget/hyperbudget-core), where the meat is; this is just an express backend.

## About

This is a budgeting helper. Right now, the only way to use it is to install locally and browse to `${HOST}:${PORT}`. But the idea is to make it a real website where people can make accounts and so on.

Users can import transactions from their bank accounts (currently only in `CSV` format; there are plans to improve this in the future).

Users can then configure transaction categories in `config.json` (**subject to change**). This makes certain transations appear differently in the user's statements. Transactions can also be moved forward or backwards from their original time.

See the [wiki](https://github.com/errietta/hyperbudget/wiki/Categories) for information on how this works.

**SUBJECT TO CHANGE**

This is very early code. The behaviour documented here may change or this may disappear entirely.

## Install

* Get mongodb
* Set up .env with your mongodb connection string
`MONGODB_URI='mongodb://localhost:27017/hyperbudget-dev'`
* Set the JWT secret in `config.json`
* Run `npm install`


## Configure

`cp config.json.example config.json && vim config.json`

This is how you configure the app. For now. The next step in development will be to store this information in the db.
In general, you want at the very least to keep the "income", "expenditure", and "main income" categories for the app to be useful, but you probably also want to tweak the categories to whatever is meaningful to you!

### Run

The port and host can be configured in the `BUDGET_PORT` and `BUDGET_HOST` env vars.

`npm start`

# Todo

* Trello https://trello.com/b/Xsc32l6a/hyperbudget
* GH https://github.com/errietta/hyperbudget/issues

## Bugs

All of them!

## What is this?

`¯\_(ツ)_/¯`

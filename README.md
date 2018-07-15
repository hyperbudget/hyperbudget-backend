# hyperbudget

A budget helper. See also [hyperbudget-core](https://github.com/hyperbudget/hyperbudget-core), where the meat is; this is just an express backend.

## About

This is a budgeting helper.

Users can import transactions from their bank accounts (currently only in `CSV` format; there are plans to improve this in the future).

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

### Run

The port and host can be configured in the `PORT` and `HOST` env vars.

`npm start`

# Todo

* Trello https://trello.com/b/Xsc32l6a/hyperbudget
* GH https://github.com/errietta/hyperbudget/issues

# Routes

## Register

```
POST http://localhost:3000/account/register HTTP/1.1
content-type: application/json

{
    "email": "errietta33@errietta.me",
    "password": "passpasspass",
    "firstname": "Errietta",
    "lastname": "Kostala"
}
```

## Login

```
POST http://localhost:3000/account/login HTTP/1.1
content-type: application/json

{
    "email": "errietta33@errietta.me",
    "password": "passpasspass"
}
```

## Categories

See the [categories API](https://github.com/hyperbudget/hyperbudget-core/wiki/Categories)

```
POST http://0.0.0.0:3000/account/categories/list
Content-Type: application/json
x-jwt: JWT-HERE

{
  "password": "mypassword"
}

POST http://0.0.0.0:3000/account/categories/update
Content-Type: application/json
x-jwt: JWT_HERE

{
  "password": "mypass"
  "categories": [{
    "name": "Income",
    "category_rules": {
      "txn_amount_credit": {
        "mode": 1001,
        "rules": [
          [">", 0]
        ]
      },
      "txn_desc": {
        "mode": 1001,
        "rules": [
          ["!~", "YOUR NAME"]
        ]
      }
    },
    "className": "cat-income",
    "id": "income"
  }]
}

```

## Transactions


See the [transactions API](https://github.com/hyperbudget/hyperbudget-core/wiki/Transactions)

```
POST http://0.0.0.0:3000/account/transactions/list
Content-Type: application/json
x-jwt: JWT-HERE

{
  "password": "mypassword"
}

POST http://0.0.0.0:3000/account/transactions/update
Content-Type: application/json
x-jwt: JWT-HERE

{
  "password": "mypassword",
  "transactions": [{
    "txn_src": "lloyds",
    "txn_amount_credit": "500",
    "txn_desc": "Description"
  }]
}
```





## Bugs

All of them!

## What is this?

`¯\_(ツ)_/¯`

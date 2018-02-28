const querystring = require('querystring');
const fetch = require('node-fetch');

export class FairFXRetailRESTRemote {
  private auth_token: string;
  private api_root: string = 'https://restapi.fairfx.com/rest';

  async do_request(method: string, path: string, data: any): Promise<any> {
    console.log(`${this.api_root}${path}`);
    let str_data = (querystring.stringify(data));
    return fetch(`${this.api_root}${path}`, {
      method: method,
      body: str_data,
      headers: {
        'Accept': 'Application/json',
        'User-Agent': "Errietta's pet project",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(str_data)
      },
    })
    .then(function(res) {
      return res.json();
    }).then(function(json) {
      return new Promise((resolve, reject) => resolve(json));
    });
  }

  async authenticate(username: string, password: string): Promise<any> {
    return this.do_request(
      'post',
      '/auth',
      {
        'username': username,
        'password': password,
      }
    ).then((result) => { console.log(result); this.auth_token = result.sessionid; });
  }

  async get_transactions(card_id: number): Promise<any> {
    if (!this.auth_token) {
      throw new Error("no auth token, pls 2 auth");
    }

    return this.do_request('get', `/card/transactions/${card_id}/-/${this.auth_token}`, null);
  }

  // XXX move out of here
  translate_transactions(transactions): any {
    let records = [];

    transactions.forEach(function(txn) {
      records.push({
        // XXX not sure if we sld be using amount or bill
        //    - Re: XXX:
        //      Bill is the amount in the card's currency
        //      Amount is the amount in the payment currency. 
        // XXX these cards aren't always GBP, obv, so fix that
        txn_amount_debit: txn.IsDebit ? txn.TransactionBill : 0,
        txn_amount_credit: txn.IsDebit ? 0 : txn.TransactionBill,
        txn_desc: txn.Description,
        txn_date: txn.TransactionDate,
      });
    });

    return records;
  }
}

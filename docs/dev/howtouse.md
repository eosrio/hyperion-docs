# How to use

## 1. JavaScript client using https
Fetching data from Hyperion using JavaScript is quite simple. 

To do that we're going to use https library to make the requests.

So, the first step is to include the https lib:
````javascript
const https = require('https');
````

In this example, we will fetch the WAX chain for the transaction id: 
14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0.

This is the query:
````
"https://wax.hyperion.eosrio.io/v2/history/get_transaction?id=14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0"
````

Now, let's create a Promise function that will receive the tx id as parameter and save it into a variable called `getTransaction`:
````javascript
let getTransaction = function (args) {
    let url = "https://wax.hyperion.eosrio.io/v2/history/get_transaction?id=" + args;
    return new Promise(function (resolve) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

    })
};
````

And finally, let's call the function passing the tx id as parameter:
````javascript
(async() =>{
  let id = "14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0"
   getTransaction(id).then(data => {
      console.log(data);
  });
})();
````

Request response:

````json
{
  trx_id: '14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0',
  lib: 49925737,
  actions: [
    {
      action_ordinal: 1,
      creator_action_ordinal: 0,
      act: [Object],
      context_free: false,
      elapsed: '0',
      account_ram_deltas: [Array],
      '@timestamp': '2020-04-08T23:02:02.500',
      block_num: 49924003,
      producer: 'zenblockswax',
      trx_id: '14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0',
      global_sequence: 260804226,
      cpu_usage_us: 1173,
      net_usage_words: 36,
      inline_count: 3,
      inline_filtered: false,
      receipts: [Array],
      code_sequence: 7,
      abi_sequence: 7,
      notified: [Array],
      timestamp: '2020-04-08T23:02:02.500'
    },
    {
      action_ordinal: 2,
      creator_action_ordinal: 1,
      act: [Object],
      context_free: false,
      elapsed: '0',
      account_ram_deltas: [Array],
      '@timestamp': '2020-04-08T23:02:02.500',
      block_num: 49924003,
      producer: 'zenblockswax',
      trx_id: '14b36232e919307090c7e9a7a2b17915f40bf0ce72734647c9f8c145c110dda0',
      global_sequence: 260804227,
      receipts: [Array],
      code_sequence: 6,
      abi_sequence: 6,
      notified: [Array],
      timestamp: '2020-04-08T23:02:02.500'
    }
  ],
  query_time_ms: 45.26
}
````

<br>

## 2. Third party library
There is a third party Javascript library made by EOS Cafe. 
Refer to their github for further information: [https://github.com/eoscafe/hyperion-api](https://github.com/eoscafe/hyperion-api){:target="_blank"}

!!!note
    This is a third party library and is not maintained by EOS Rio

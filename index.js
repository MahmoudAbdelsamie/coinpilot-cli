#!/usr/bin/env node

const axios = require('axios');
const { prompt } = require('inquirer');
const Configstore = require('configstore');
const program = require('commander');
const colors = require('colors');
const dotenv = require('dotenv');

const conf = new Configstore('coinapi-cli');
const coinApiBaseUrl = 'https://rest.coinapi.io';
conf.set('apiKey', COIN_API_KEY);
const apiKey = conf.get('apiKey');

async function makeCoinApiRequest(endpoint) {
  try {
    const response = await axios.get(`${coinApiBaseUrl}${endpoint}`, {
      headers: {
        'X-CoinAPI-Key': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error making CoinAPI request:', error.message);
    throw error;
  }
}

function handleError(message) {
  console.error(message.red);
  process.exit(1);
}

// Define the 'top' command
program
  .command('top')
  .description('Get the top cryptocurrencies')
  .action(async () => {
    try {
      const data = await makeCoinApiRequest('/v1/assets');
      let count = 1;
      console.log('Top Cryptocurrencies:');
      const cryptoData = data.filter(crypto => crypto.type_is_crypto)
      cryptoData.slice(0, 10).forEach((crypto) => {
        console.log(`${count++}. ${crypto.name} (${crypto.asset_id})`);
      });
    } catch (error) {
      handleError(error.message);
    }
  });

// Define the 'price' command
program
  .command('price')
  .description('Get the price of a specific cryptocurrency')
  .action(async () => {
    try {
      const answers = await prompt([
        {
          type: 'input',
          name: 'symbol',
          message: 'Enter the symbol of the cryptocurrency:',
          validate: (value) => value.trim() !== '',
        },
      ]);
      const { symbol } = answers;
      const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
      console.log(`Price of ${symbol}: ${data[0].price_usd} USD`.green);
    } catch (error) {
      handleError(error.message);
    }
  });

// Define the 'history' command
program
  .command('history')
  .description('Get historical price data for a specific cryptocurrency')
  .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
  .option('-r, --range <range>', 'Specify the time range (e.g., 7d, 30d, 90d)')
  .action(async (options) => {
    const { symbol, range } = options;

    if (!symbol) {
      handleError('Please provide the symbol of the cryptocurrency.');
    }

    try {
      const data = await makeCoinApiRequest(`/v1/assets/${symbol}/history?period_id=1DAY&time_start=2020-01-01T00:00:00`);
      console.log(`Historical price data for ${symbol} over the last ${range || '7d'}:`);
      console.log(data);
    } catch (error) {
      handleError(`Error fetching historical price data for ${symbol}: ${error.message}`);
    }
  });

// Define the 'convert' command
program
  .command('convert')
  .description('Convert cryptocurrency amounts')
  .option('-a, --amount <amount>', 'Specify the amount to convert')
  .option('-f, --from <from>', 'Specify the source cryptocurrency symbol')
  .option('-t, --to <to>', 'Specify the target cryptocurrency symbol')
  .action(async (options) => {
    const { amount, from, to } = options;

    if (!amount || !from || !to) {
      handleError('Please provide the amount, source, and target cryptocurrencies.');
    }

    try {
      const data = await makeCoinApiRequest(`/v1/exchangerate/${from}/${to}`);
      const convertedAmount = amount * data.rate;
      console.log(`${amount} ${from} is equal to ${convertedAmount.toFixed(6)} ${to}`);
    } catch (error) {
      handleError(`Error converting ${amount} ${from} to ${to}: ${error.message}`);
    }
  });

// Define the 'info' command
program
  .command('info')
  .description('Display additional information about a specific cryptocurrency')
  .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
  .action(async (options) => {
    const { symbol } = options;

    if (!symbol) {
      handleError('Please provide the symbol of the cryptocurrency.');
    }

    try {
      const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
      console.log(`Additional information for ${symbol}:`);
      console.log(data);
    } catch (error) {
      handleError(`Error fetching additional information for ${symbol}: ${error.message}`);
    }
  });

program.parse(process.argv);





// #!/usr/bin/env node

// const axios = require('axios');
// const program = require('commander');
// const { prompt } = require('inquirer');
// const Configstore = require('configstore');
// const colors = require('colors');

// async function start() {
//   try {
//     const Configstore = (await import('configstore')).default;

//     const answers = await prompt([
//       {
//         type: 'input',
//         name: 'username',
//         message: 'Enter your username:',
//       },
//     ]);

//     const config = new Configstore('coinpilot');

//     console.log('Answers:', answers);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//   }
// }

// start();

// const conf = new Configstore('coinapi-cli');

// program
//   .version('1.0.0')
//   .description('CoinPilot CLI App');

// program.parse(process.argv);

// const coinApiBaseUrl = 'https://rest.coinapi.io';
// const apiKey = '1AE1F564-3971-4873-827E-C834033D8819';

// conf.set('apiKey', apiKey);

// async function makeCoinApiRequest(endpoint) {
//   try {
//     const response = await axios.get(`${coinApiBaseUrl}${endpoint}`, {
//       headers: {
//         'X-CoinAPI-Key': apiKey,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error making CoinAPI request:', error.message);
//     throw error;
//   }
// }

// program
//   .command('top')
//   .description('Get the top cryptocurrencies')
//   .action(async () => {
//     try {
//       const data = await makeCoinApiRequest('/v1/assets');
//       console.log('Top Cryptocurrencies:');
//       data.slice(0, 10).forEach((crypto) => {
//         console.log(`${crypto.rank}. ${crypto.name} (${crypto.symbol})`);
//       });
//     } catch (error) {
//       handleError(error.message);
//     }
//   });

// program
//   .command('price')
//   .description('Get the price of a specific cryptocurrency')
//   .action(async () => {
//     const answers = await inquirer.prompt([
//       {
//         type: 'input',
//         name: 'symbol',
//         message: 'Enter the symbol of the cryptocurrency:',
//         validate: (value) => value.trim() !== '',
//       },
//     ]);

//     try {
//       const { symbol } = answers;
//       const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
//       console.log(`Price of ${symbol}: ${data.price_usd} USD`.green);
//     } catch (error) {
//       handleError(error.message);
//     }
//   });

// program
//   .command('history')
//   .description('Get historical price data for a specific cryptocurrency')
//   .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
//   .option('-r, --range <range>', 'Specify the time range (e.g., 7d, 30d, 90d)')
//   .action(async (options) => {
//     const { symbol, range } = options;

//     if (!symbol) {
//       handleError('Please provide the symbol of the cryptocurrency.');
//     }

//     try {
//       const data = await makeCoinApiRequest(`/v1/assets/${symbol}/history?period_id=1DAY&time_start=2020-01-01T00:00:00`);
//       console.log(`Historical price data for ${symbol} over the last ${range || '7d'}:`);
//       console.log(data);
//     } catch (error) {
//       handleError(`Error fetching historical price data for ${symbol}: ${error.message}`);
//     }
//   });

// program
//   .command('convert')
//   .description('Convert cryptocurrency amounts')
//   .option('-a, --amount <amount>', 'Specify the amount to convert')
//   .option('-f, --from <from>', 'Specify the source cryptocurrency symbol')
//   .option('-t, --to <to>', 'Specify the target cryptocurrency symbol')
//   .action(async (options) => {
//     const { amount, from, to } = options;

//     if (!amount || !from || !to) {
//       handleError('Please provide the amount, source, and target cryptocurrencies.');
//     }

//     try {
//       const data = await makeCoinApiRequest(`/v1/exchangerate/${from}/${to}`);
//       const convertedAmount = amount * data.rate;
//       console.log(`${amount} ${from} is equal to ${convertedAmount.toFixed(6)} ${to}`);
//     } catch (error) {
//       handleError(`Error converting ${amount} ${from} to ${to}: ${error.message}`);
//     }
//   });

// program
//   .command('info')
//   .description('Display additional information about a specific cryptocurrency')
//   .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
//   .action(async (options) => {
//     const { symbol } = options;

//     if (!symbol) {
//       handleError('Please provide the symbol of the cryptocurrency.');
//     }

//     try {
//       const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
//       console.log(`Additional information for ${symbol}:`);
//       console.log(data);
//     } catch (error) {
//       handleError(`Error fetching additional information for ${symbol}: ${error.message}`);
//     }
//   });

// function handleError(message) {
//   console.error(message.red);
//   process.exit(1);
// }



// // index.js
// const axios = require('axios');
// const program = require('commander');
// // const { prompt } = await import('inquirer');
// // const Configstore = require('configstore');
// const colors = require('colors');

// // bin/index.js
// async function start() {
//     try {
//       const { prompt } = await import('inquirer');
//       const Configstore = (await import('configstore')).default;
  
//       // Your code using inquirer and configstore goes here
//       const answers = await prompt([
//         {
//           type: 'input',
//           name: 'username',
//           message: 'Enter your username:',
//         },
//         // Add more questions as needed
//       ]);
  
//       const config = new Configstore('coinpilot');
  
//       // Use the 'config' object as needed in your code
  
//       console.log('Answers:', answers);
//     } catch (error) {
//       console.error(`Error: ${error.message}`);
//     }
//   }
  
//   // Call the asynchronous function
//   start();
  
//   // Call the asynchronous function
//   start();

// const conf = new Configstore('coinapi-cli');

// program
//   .version('1.0.0')
//   .description('CoinPilot CLI App');


// program.parse(process.argv);



// const coinApiBaseUrl = 'https://rest.coinapi.io';


// const apiKey = '1AE1F564-3971-4873-827E-C834033D8819';


// conf.set('apiKey', apiKey);


// async function makeCoinApiRequest(endpoint) {
//   try {
//     const response = await axios.get(`${coinApiBaseUrl}${endpoint}`, {
//       headers: {
//         'X-CoinAPI-Key': apiKey,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error making CoinAPI request:', error.message);
//     throw error;
//   }
// }

// // get the top cryptocurrencies
// program
//   .command('top')
//   .description('Get the top cryptocurrencies')
//   .action(async () => {
//     try {
//       const data = await makeCoinApiRequest('/v1/assets');
//       console.log('Top Cryptocurrencies:');
//       data.slice(0, 10).forEach((crypto) => {
//         console.log(`${crypto.rank}. ${crypto.name} (${crypto.symbol})`);
//       });
//     } catch (error) {
//         handleError(error.message);
//     }
//   });

// // get the price of a specific cryptocurrency
// program
//   .command('price')
//   .description('Get the price of a specific cryptocurrency')
//   .action(async () => {
//     const answers = await inquirer.prompt([
//       {
//         type: 'input',
//         name: 'symbol',
//         message: 'Enter the symbol of the cryptocurrency:',
//         validate: (value) => value.trim() !== '',
//       },
//     ]);

//     try {
//       const { symbol } = answers;
//       const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
//       console.log(`Price of ${symbol}: ${data.price_usd} USD`.green);
//     } catch (error) {
//         handleError(error.message);
//     }
//   });


//   // get historical price data for a specific cryptocurrency
//   program
//     .command('history')
//     .description('Get historical price data for a specific cryptocurrency')
//     .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
//     .option('-r, --range <range>', 'Specify the time range (e.g., 7d, 30d, 90d)')
//     .action(async (options) => {
//       const { symbol, range } = options;
  
//       if (!symbol) {
//         handleError('Please provide the symbol of the cryptocurrency.');
//       }
  
//       try {
//         const data = await makeCoinApiRequest(`/v1/assets/${symbol}/history?period_id=1DAY&time_start=2020-01-01T00:00:00`);
//         console.log(`Historical price data for ${symbol} over the last ${range || '7d'}:`);
//         console.log(data);
//       } catch (error) {
//         handleError(`Error fetching historical price data for ${symbol}: ${error.message}`);
//       }
//     });
  
//   // convert cryptocurrency amounts
//   program
//     .command('convert')
//     .description('Convert cryptocurrency amounts')
//     .option('-a, --amount <amount>', 'Specify the amount to convert')
//     .option('-f, --from <from>', 'Specify the source cryptocurrency symbol')
//     .option('-t, --to <to>', 'Specify the target cryptocurrency symbol')
//     .action(async (options) => {
//       const { amount, from, to } = options;
  
//       if (!amount || !from || !to) {
//         handleError('Please provide the amount, source, and target cryptocurrencies.');
//       }
  
//       try {
//         const data = await makeCoinApiRequest(`/v1/exchangerate/${from}/${to}`);
//         const convertedAmount = amount * data.rate;
//         console.log(`${amount} ${from} is equal to ${convertedAmount.toFixed(6)} ${to}`);
//       } catch (error) {
//         handleError(`Error converting ${amount} ${from} to ${to}: ${error.message}`);
//       }
//     });
  
//   // display information about your cryptocurrency portfolio
// //   program
// //     .command('portfolio')
// //     .description('Display information about your cryptocurrency portfolio')
// //     .action(() => {
// //       console.log('Fetching portfolio information...');
// //       // Add logic to retrieve and display portfolio data
// //     });
  
//   // display additional information about a specific cryptocurrency
//   program
//     .command('info')
//     .description('Display additional information about a specific cryptocurrency')
//     .option('-s, --symbol <symbol>', 'Specify the symbol of the cryptocurrency')
//     .action(async (options) => {
//       const { symbol } = options;
  
//       if (!symbol) {
//         handleError('Please provide the symbol of the cryptocurrency.');
//       }
  
//       try {
//         const data = await makeCoinApiRequest(`/v1/assets/${symbol}/`);
//         console.log(`Additional information for ${symbol}:`);
//         console.log(data);
//       } catch (error) {
//         handleError(`Error fetching additional information for ${symbol}: ${error.message}`);
//       }
//     });
  

// function handleError(message) {
//     throw new Error(message.red);
//   }

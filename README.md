# api_test
NestJS

Simple Cryptocurrency Price and Market Cap API
This is a simple price and market cap API for an imaginary cryptocurrency. It returns the current price of the coin in USD, as well as the total supply and market cap at the given price (in USD), as well as in ETH and BTC terms. It connects to a PostgreSQL database and pulls data from a Baserow instance and a public crypto price API like Coingecko.

Technologies Used
Node.js
TypeScript
NestJS
PostgreSQL
TypeORM
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your_username/simple-crypto-api.git
cd simple-crypto-api
Install dependencies:

Copy code
npm install
Set up a PostgreSQL database and create a coin_data table with columns for total_supply, current_price, usd_market_cap, btc_market_cap, and eth_market_cap.

Set up a Baserow instance and populate the coin_data table with data for the imaginary cryptocurrency.

Obtain an API key for Coingecko.

Set up environment variables in a .env file in the root of the project:

makefile
Copy code
BASEROW_API_KEY=<your_baserow_api_key>
COINGECKO_API_KEY=<your_coingecko_api_key>
POSTGRES_HOST=<your_postgres_host>
POSTGRES_PORT=<your_postgres_port>
POSTGRES_USERNAME=<your_postgres_username>
POSTGRES_PASSWORD=<your_postgres_password>
POSTGRES_DATABASE=<your_postgres_database>
Start the NestJS application:

arduino
Copy code
npm run start
API Endpoints
GET /total-supply
Returns the total supply of the cryptocurrency.

GET /current-price
Returns the current price of the cryptocurrency.

GET /market-cap/:unit
Returns the market cap of the cryptocurrency in the specified unit (USD, BTC, or ETH).

POST /update-data
Updates the data in the database by pulling data from the Baserow instance and Coingecko API, and calculating the market cap. This endpoint must be triggered by a POST request.

Testing
To run tests, run the following command:

arduino
Copy code
npm run test
License
This project is licensed under the MIT License. See the LICENSE file for details.

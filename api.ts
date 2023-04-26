import axios from 'axios';
import { Connection, createConnection } from 'typeorm';

interface CoinData {
  totalSupply: number;
  currentPrice: number;
}

interface ExternalPriceData {
  btcPrice: number;
  ethPrice: number;
}

interface MarketCapData {
  usd: number;
  btc: number;
  eth: number;
}

async function connectToDatabase(): Promise<Connection> {
  return createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'your_username',
    password: 'your_password',
    database: 'your_database',
    entities: [], 
    synchronize: true,
  });
}

export async function getCoinData(): Promise<CoinData> {
  const response = await axios.get('https://api.baserow.io/api/database/1/table/2/rows/'); // Here we assume that the data is saved there, to be modified according to Baserow architecture.

  const { total_supply: totalSupply, current_price: currentPrice } = response.data[0].fields;

  return { totalSupply, currentPrice };
}

export async function getExternalPriceData(): Promise<ExternalPriceData> {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');

  const { bitcoin: { usd: btcPrice }, ethereum: { usd: ethPrice } } = response.data;

  return { btcPrice, ethPrice };
}

export function getMarketCapData(coinData: CoinData, externalPriceData: ExternalPriceData): MarketCapData {
  const usdMarketCap = coinData.totalSupply * coinData.currentPrice;
  const btcMarketCap = usdMarketCap / externalPriceData.btcPrice;
  const ethMarketCap = usdMarketCap / externalPriceData.ethPrice;

  return { usd: usdMarketCap, btc: btcMarketCap, eth: ethMarketCap };
}

export async function updateCoinData(): Promise<void> {
  const coinData = await getCoinData();
  const externalPriceData = await getExternalPriceData();
  const marketCapData = getMarketCapData(coinData, externalPriceData);

  const connection = await connectToDatabase();

  await connection.query(`INSERT INTO coin_data (total_supply, current_price, usd_market_cap, btc_market_cap, eth_market_cap) VALUES (${coinData.totalSupply}, ${coinData.currentPrice}, ${marketCapData.usd}, ${marketCapData.btc}, ${marketCapData.eth})`);

  await connection.close();
}

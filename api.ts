import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'typeorm';

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

@Entity()
export class Coin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  totalSupply: number;

  @Column()
  currentPrice: number;

  @Column()
  usdMarketCap: number;

  @Column()
  btcMarketCap: number;

  @Column()
  ethMarketCap: number;
}

@Controller()
export class AppController {
  @Get('total-supply')
  async getTotalSupply(): Promise<number> {
    const coin = await Coin.findOne();
    return coin.totalSupply;
  }

  @Get('current-price')
  async getCurrentPrice(): Promise<number> {
    const coin = await Coin.findOne();
    return coin.currentPrice;
  }

  @Get('market-cap/:unit')
  async getMarketCap(@Param('unit') unit: string): Promise<number> {
    const coin = await Coin.findOne();
    let marketCap;

    switch (unit.toLowerCase()) {
      case 'usd':
        marketCap = coin.usdMarketCap;
        break;
      case 'btc':
        marketCap = coin.btcMarketCap;
        break;
      case 'eth':
        marketCap = coin.ethMarketCap;
        break;
      default:
        throw new Error(`Invalid unit specified: ${unit}`);
    }

    return marketCap;
  }

  @Post('update-data')
  async updateData(): Promise<void> {
    const baserowApiKey = process.env.BASEROW_API_KEY;
    const coingeckoApiKey = process.env.COINGECKO_API_KEY;

    if (!baserowApiKey || !coingeckoApiKey) {
      throw new Error('Missing API keys in environment variables');
    }

    const baserowResponse = await axios.get(`https://api.baserow.io/api/database/1/table/2/rows/?filter__order_by=-id&limit=1`, {
      headers: {
        Authorization: `Bearer ${baserowApiKey}`,
      },
    });

    const { totalSupply, currentPrice } = baserowResponse.data[0].fields;

    const coingeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`, {
      headers: {
        Authorization: `Bearer ${coingeckoApiKey}`,
      },
    });

    const { bitcoin: { usd: btcPrice }, ethereum: { usd: ethPrice } } = coingeckoResponse.data;

    const usdMarketCap = totalSupply * currentPrice;
    const btcMarketCap = usdMarketCap / btcPrice;
    const ethMarketCap = usdMarketCap / ethPrice;

    const coin = await Coin.findOne();
    coin.totalSupply = totalSupply;
    coin.currentPrice = currentPrice;
    coin.usdMarketCap = usdMarketCap;
    coin.btcMarketCap = btcMarketCap;
    coin.ethMarketCap = ethMarketCap;
    await coin.save();
  }
}

async function bootstrap() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
username: process.env.POSTGRES_USERNAME,
password: process.env.POSTGRES_PASSWORD,
database: process.env.POSTGRES_DATABASE,
entities: [Coin],
synchronize: true,
});

const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(3000);
}
bootstrap();

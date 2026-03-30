export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
  allTimeHigh: number;
  allTimeHighDate: string;
  category: "layer1" | "layer2" | "defi" | "stablecoin";
  stakingYield: number | null;
  description: string;
}

// Realistic mid-2024 data
export const CRYPTO_DATA: CryptoAsset[] = [
  {
    symbol: "BTC", name: "Bitcoin", price: 67234.50, change24h: 1.2, change7d: 3.5, change30d: 8.2,
    marketCap: 1324000000000, volume24h: 28500000000, circulatingSupply: 19700000, maxSupply: 21000000,
    allTimeHigh: 73750, allTimeHighDate: "2024-03-14", category: "layer1", stakingYield: null,
    description: "The first and largest cryptocurrency by market cap. Digital gold and store of value.",
  },
  {
    symbol: "ETH", name: "Ethereum", price: 3456.80, change24h: 0.8, change7d: 2.1, change30d: 5.4,
    marketCap: 415000000000, volume24h: 15200000000, circulatingSupply: 120200000, maxSupply: null,
    allTimeHigh: 4878, allTimeHighDate: "2021-11-10", category: "layer1", stakingYield: 3.8,
    description: "Smart contract platform. Hosts most DeFi and NFT activity. Proof of Stake since The Merge.",
  },
  {
    symbol: "SOL", name: "Solana", price: 142.30, change24h: 2.5, change7d: 5.8, change30d: 12.1,
    marketCap: 63500000000, volume24h: 2800000000, circulatingSupply: 446000000, maxSupply: null,
    allTimeHigh: 260, allTimeHighDate: "2021-11-06", category: "layer1", stakingYield: 6.5,
    description: "High-performance L1 blockchain. 65,000 TPS with sub-second finality. Growing DeFi ecosystem.",
  },
  {
    symbol: "BNB", name: "BNB", price: 598.40, change24h: -0.3, change7d: 1.2, change30d: 3.8,
    marketCap: 91200000000, volume24h: 1500000000, circulatingSupply: 152500000, maxSupply: 200000000,
    allTimeHigh: 720, allTimeHighDate: "2024-06-06", category: "layer1", stakingYield: null,
    description: "Native token of Binance ecosystem. Used for trading fee discounts and BSC gas fees.",
  },
  {
    symbol: "XRP", name: "XRP", price: 0.52, change24h: -0.5, change7d: -1.2, change30d: 2.1,
    marketCap: 28800000000, volume24h: 1200000000, circulatingSupply: 55400000000, maxSupply: 100000000000,
    allTimeHigh: 3.40, allTimeHighDate: "2018-01-07", category: "layer1", stakingYield: null,
    description: "Payment-focused cryptocurrency. Used for cross-border transactions via RippleNet.",
  },
  {
    symbol: "ADA", name: "Cardano", price: 0.42, change24h: 0.2, change7d: -0.8, change30d: -3.5,
    marketCap: 15100000000, volume24h: 350000000, circulatingSupply: 35900000000, maxSupply: 45000000000,
    allTimeHigh: 3.10, allTimeHighDate: "2021-09-02", category: "layer1", stakingYield: 4.2,
    description: "Research-driven L1 blockchain. Peer-reviewed academic approach to development.",
  },
  {
    symbol: "AVAX", name: "Avalanche", price: 28.50, change24h: 1.8, change7d: 4.2, change30d: -2.1,
    marketCap: 11200000000, volume24h: 420000000, circulatingSupply: 393000000, maxSupply: 720000000,
    allTimeHigh: 146, allTimeHighDate: "2021-11-21", category: "layer1", stakingYield: 8.5,
    description: "Subnet architecture enables custom blockchains. Sub-second finality for DeFi applications.",
  },
  {
    symbol: "DOT", name: "Polkadot", price: 6.35, change24h: -0.8, change7d: -2.1, change30d: -5.2,
    marketCap: 8900000000, volume24h: 280000000, circulatingSupply: 1400000000, maxSupply: null,
    allTimeHigh: 55, allTimeHighDate: "2021-11-04", category: "layer1", stakingYield: 15.2,
    description: "Multi-chain interoperability platform. Parachains connect diverse blockchains.",
  },
  {
    symbol: "LINK", name: "Chainlink", price: 14.20, change24h: 1.5, change7d: 3.8, change30d: 6.2,
    marketCap: 8500000000, volume24h: 450000000, circulatingSupply: 598000000, maxSupply: 1000000000,
    allTimeHigh: 52.88, allTimeHighDate: "2021-05-10", category: "defi", stakingYield: 4.5,
    description: "Decentralized oracle network. Provides real-world data to smart contracts across chains.",
  },
  {
    symbol: "MATIC", name: "Polygon", price: 0.58, change24h: -1.2, change7d: -3.5, change30d: -8.1,
    marketCap: 5800000000, volume24h: 320000000, circulatingSupply: 10000000000, maxSupply: 10000000000,
    allTimeHigh: 2.92, allTimeHighDate: "2021-12-27", category: "layer2", stakingYield: 5.8,
    description: "Ethereum scaling solution. ZK-rollups and sidechains for faster, cheaper transactions.",
  },
];

export function getCryptoBySymbol(symbol: string): CryptoAsset | undefined {
  return CRYPTO_DATA.find((c) => c.symbol === symbol);
}

export function getTotalMarketCap(): number {
  return CRYPTO_DATA.reduce((sum, c) => sum + c.marketCap, 0);
}

export function getTopByMarketCap(n: number = 5): CryptoAsset[] {
  return [...CRYPTO_DATA].sort((a, b) => b.marketCap - a.marketCap).slice(0, n);
}

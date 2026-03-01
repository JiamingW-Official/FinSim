export interface FundamentalsData {
  sector: string;
  marketCap: string;
  peRatio: number;
  eps: number;
  dividendYield: number;
  beta: number;
  week52High: number;
  week52Low: number;
  avgVolume: string;
  description: string;
}

export const FUNDAMENTALS: Record<string, FundamentalsData> = {
  AAPL: {
    sector: "Technology",
    marketCap: "$3.4T",
    peRatio: 33.2,
    eps: 6.42,
    dividendYield: 0.44,
    beta: 1.24,
    week52High: 260.1,
    week52Low: 164.08,
    avgVolume: "54.2M",
    description:
      "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. The company also sells a variety of services including advertising, AppleCare, cloud, digital content, and payment services.",
  },
  MSFT: {
    sector: "Technology",
    marketCap: "$3.1T",
    peRatio: 35.8,
    eps: 11.86,
    dividendYield: 0.72,
    beta: 0.89,
    week52High: 468.35,
    week52Low: 385.58,
    avgVolume: "19.8M",
    description:
      "Microsoft develops and licenses software, services, devices, and solutions. Its products include the Windows operating system, Office productivity suite, Azure cloud platform, LinkedIn, and Xbox gaming consoles.",
  },
  GOOG: {
    sector: "Technology",
    marketCap: "$2.2T",
    peRatio: 24.5,
    eps: 7.54,
    dividendYield: 0.45,
    beta: 1.06,
    week52High: 201.42,
    week52Low: 150.22,
    avgVolume: "22.1M",
    description:
      "Alphabet is the parent company of Google. It generates revenue primarily through advertising on Google Search, YouTube, and its ad network. The company also operates Google Cloud, Waymo autonomous vehicles, and other technology ventures.",
  },
  AMZN: {
    sector: "Consumer Cyclical",
    marketCap: "$2.1T",
    peRatio: 42.6,
    eps: 4.67,
    dividendYield: 0,
    beta: 1.15,
    week52High: 232.57,
    week52Low: 151.61,
    avgVolume: "41.3M",
    description:
      "Amazon is the world's largest online retailer and cloud computing provider (AWS). The company also operates in digital streaming, artificial intelligence, and consumer electronics through products like Alexa and Kindle.",
  },
  NVDA: {
    sector: "Technology",
    marketCap: "$3.3T",
    peRatio: 55.4,
    eps: 2.53,
    dividendYield: 0.03,
    beta: 1.68,
    week52High: 153.13,
    week52Low: 75.61,
    avgVolume: "248.5M",
    description:
      "NVIDIA designs and sells graphics processing units (GPUs) for gaming, data centers, and AI workloads. The company is a dominant force in AI chip manufacturing, powering most machine learning training and inference worldwide.",
  },
  TSLA: {
    sector: "Consumer Cyclical",
    marketCap: "$1.1T",
    peRatio: 96.2,
    eps: 3.65,
    dividendYield: 0,
    beta: 2.05,
    week52High: 488.54,
    week52Low: 138.8,
    avgVolume: "98.7M",
    description:
      "Tesla designs, develops, manufactures, and sells electric vehicles, energy storage systems, and solar products. The company is also investing heavily in autonomous driving technology and AI-powered robotics.",
  },
  JPM: {
    sector: "Financial Services",
    marketCap: "$680B",
    peRatio: 12.8,
    eps: 18.22,
    dividendYield: 2.05,
    beta: 1.12,
    week52High: 280.25,
    week52Low: 194.5,
    avgVolume: "8.9M",
    description:
      "JPMorgan Chase is the largest bank in the United States by assets. It operates in investment banking, financial services, asset management, and consumer & commercial banking across 100+ countries.",
  },
  SPY: {
    sector: "ETF",
    marketCap: "$570B",
    peRatio: 23.1,
    eps: 24.52,
    dividendYield: 1.22,
    beta: 1.0,
    week52High: 609.07,
    week52Low: 493.86,
    avgVolume: "72.5M",
    description:
      "The SPDR S&P 500 ETF Trust (SPY) tracks the S&P 500 index, which includes 500 of the largest U.S. companies. It is the most traded ETF in the world, offering broad exposure to the U.S. stock market in a single investment.",
  },
  QQQ: {
    sector: "ETF",
    marketCap: "$300B",
    peRatio: 31.5,
    eps: 16.18,
    dividendYield: 0.55,
    beta: 1.18,
    week52High: 540.81,
    week52Low: 411.34,
    avgVolume: "38.2M",
    description:
      "The Invesco QQQ ETF tracks the Nasdaq-100 index, which includes 100 of the largest non-financial companies listed on Nasdaq. It is heavily weighted toward technology stocks like Apple, Microsoft, and NVIDIA.",
  },
  META: {
    sector: "Technology",
    marketCap: "$1.6T",
    peRatio: 27.3,
    eps: 22.08,
    dividendYield: 0.32,
    beta: 1.23,
    week52High: 736.67,
    week52Low: 414.5,
    avgVolume: "15.4M",
    description:
      "Meta Platforms operates social media platforms including Facebook, Instagram, WhatsApp, and Messenger. The company is also investing heavily in virtual reality hardware (Meta Quest) and building the metaverse.",
  },
};

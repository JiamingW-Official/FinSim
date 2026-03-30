export interface MarketWisdom {
  quote: string;
  author: string;
  category: "risk" | "psychology" | "strategy" | "discipline" | "market";
  lesson: string;
}

export const MARKET_WISDOM: MarketWisdom[] = [
  // Risk
  {
    quote: "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.",
    author: "Warren Buffett",
    category: "risk",
    lesson:
      "Capital preservation is the foundation of long-term wealth building. Avoiding large losses matters more than chasing large gains.",
  },
  {
    quote: "Risk comes from not knowing what you are doing.",
    author: "Warren Buffett",
    category: "risk",
    lesson:
      "Education and thorough analysis are the best risk management tools. Never trade instruments or strategies you don't fully understand.",
  },
  {
    quote: "The biggest risk of all is not taking one.",
    author: "Mellody Hobson",
    category: "risk",
    lesson:
      "Being overly conservative carries its own risk through inflation erosion and missed compounding. Balance prudence with action.",
  },
  {
    quote: "There is no return without risk, no reward without effort, and no opportunity without sacrifice.",
    author: "Michael Bloomberg",
    category: "risk",
    lesson:
      "Risk and reward are fundamentally linked. The goal is not to eliminate risk but to take intelligent risks where the payoff justifies the exposure.",
  },
  {
    quote: "You can be right on a trade and still lose money if your position size is wrong.",
    author: "Paul Tudor Jones",
    category: "risk",
    lesson:
      "Position sizing is as important as trade direction. Even great trades can destroy accounts when sized too aggressively.",
  },
  {
    quote: "I'm always thinking about losing money as opposed to making money. Don't focus on making money, focus on protecting what you have.",
    author: "Paul Tudor Jones",
    category: "risk",
    lesson:
      "A defensive mindset protects capital during drawdowns and keeps you in the game long enough to benefit from future opportunities.",
  },
  {
    quote: "Risk means more things can happen than will happen.",
    author: "Howard Marks",
    category: "risk",
    lesson:
      "Outcomes are drawn from distributions, not certainties. Acknowledging the range of possible outcomes leads to better preparation.",
  },
  {
    quote: "In investing, what is comfortable is rarely profitable.",
    author: "Robert Arnott",
    category: "risk",
    lesson:
      "The best opportunities often arise when most participants are fearful. Getting comfortable with discomfort is a key investing edge.",
  },
  {
    quote: "Diversification is the only free lunch in investing.",
    author: "Harry Markowitz",
    category: "risk",
    lesson:
      "Spreading risk across uncorrelated assets can reduce portfolio volatility without sacrificing expected returns.",
  },
  {
    quote: "More money has been lost reaching for yield than at the point of a gun.",
    author: "Raymond DeVoe Jr.",
    category: "risk",
    lesson:
      "Chasing higher returns often leads investors into excessive risk. If a yield looks too good to be true, it probably is.",
  },

  // Psychology
  {
    quote: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
    category: "psychology",
    lesson:
      "Patience is one of the most valuable but underrated traits in investing. Short-term noise creates opportunities for long-term thinkers.",
  },
  {
    quote: "The market is a pendulum that forever swings between unsustainable optimism and unjustified pessimism.",
    author: "Benjamin Graham",
    category: "psychology",
    lesson:
      "Extreme market sentiment in either direction eventually reverts. Recognizing where we are in the sentiment cycle is a valuable skill.",
  },
  {
    quote: "Be fearful when others are greedy and greedy when others are fearful.",
    author: "Warren Buffett",
    category: "psychology",
    lesson:
      "Contrarian thinking is difficult but rewarding. The best buying opportunities often come during periods of maximum fear.",
  },
  {
    quote: "The four most dangerous words in investing are: 'This time it's different.'",
    author: "Sir John Templeton",
    category: "psychology",
    lesson:
      "Human nature and market cycles repeat. Believing that historical patterns no longer apply often precedes significant losses.",
  },
  {
    quote: "The investor's chief problem, and his worst enemy, is likely to be himself.",
    author: "Benjamin Graham",
    category: "psychology",
    lesson:
      "Emotional biases cause more portfolio damage than any external factor. Self-awareness and systematic decision-making are essential.",
  },
  {
    quote: "Markets can remain irrational longer than you can remain solvent.",
    author: "John Maynard Keynes",
    category: "psychology",
    lesson:
      "Being right eventually is not enough if you run out of capital first. Always maintain enough cushion to survive extended adverse moves.",
  },
  {
    quote: "It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.",
    author: "Charles Darwin (applied by Ray Dalio)",
    category: "psychology",
    lesson:
      "Adaptability is crucial in markets. Strategies that worked in one regime may fail in another. Continuous learning and flexibility are essential.",
  },
  {
    quote: "The most important quality for an investor is temperament, not intellect.",
    author: "Warren Buffett",
    category: "psychology",
    lesson:
      "Emotional control under stress separates successful investors from the crowd. Intelligence without discipline often leads to overtrading.",
  },
  {
    quote: "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
    author: "Philip Fisher",
    category: "psychology",
    lesson:
      "Price and value are different concepts. Understanding the intrinsic value of what you own prevents panic selling during drawdowns.",
  },
  {
    quote: "Everyone has the brainpower to follow the stock market. If you made it through fifth-grade math, you can do it.",
    author: "Peter Lynch",
    category: "psychology",
    lesson:
      "Investing is not as complex as Wall Street wants you to believe. Common sense and diligent research can outperform sophisticated models.",
  },

  // Strategy
  {
    quote: "Know what you own, and know why you own it.",
    author: "Peter Lynch",
    category: "strategy",
    lesson:
      "Every position in your portfolio should have a clear thesis. If you cannot explain why you own something in two sentences, reconsider the position.",
  },
  {
    quote: "The time to buy is when there's blood in the streets, even if the blood is your own.",
    author: "Baron Rothschild",
    category: "strategy",
    lesson:
      "Extreme fear creates the best value opportunities. Having cash available and the courage to deploy it during crises is a proven wealth builder.",
  },
  {
    quote: "Wide diversification is only required when investors do not understand what they are doing.",
    author: "Warren Buffett",
    category: "strategy",
    lesson:
      "Concentrated positions in high-conviction ideas can outperform broad diversification, but only when backed by deep understanding and research.",
  },
  {
    quote: "Buy not on optimism, but on arithmetic.",
    author: "Benjamin Graham",
    category: "strategy",
    lesson:
      "Investment decisions should be driven by valuation metrics and analysis, not narratives and feelings. Numbers are harder to manipulate than stories.",
  },
  {
    quote: "In the short run, the market is a voting machine, but in the long run it is a weighing machine.",
    author: "Benjamin Graham",
    category: "strategy",
    lesson:
      "Short-term prices reflect popularity and sentiment. Long-term prices converge to fundamental value. Align your time horizon with your strategy.",
  },
  {
    quote: "Go for a business that any idiot can run, because sooner or later, any idiot probably is going to run it.",
    author: "Peter Lynch",
    category: "strategy",
    lesson:
      "Simple, durable business models with wide moats are safer investments than complex ones dependent on brilliant management.",
  },
  {
    quote: "The goal of a successful trader is to make the best trades. Money is secondary.",
    author: "Alexander Elder",
    category: "strategy",
    lesson:
      "Focusing on process over outcomes leads to better long-term results. If your process is sound, profits follow naturally.",
  },
  {
    quote: "It's not whether you're right or wrong that's important, it's how much money you make when you're right and how much you lose when you're wrong.",
    author: "George Soros",
    category: "strategy",
    lesson:
      "Asymmetric payoffs are the key to profitability. You can be wrong most of the time and still profit if your winners vastly exceed your losers.",
  },
  {
    quote: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
    author: "Albert Einstein (attributed)",
    category: "strategy",
    lesson:
      "Time in the market harnesses compounding. Starting early and staying invested is the single most powerful wealth-building strategy available.",
  },
  {
    quote: "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Benjamin Graham",
    category: "strategy",
    lesson:
      "Distinguish between investing (buying businesses) and speculating (betting on price moves). Most people benefit from the former approach.",
  },

  // Discipline
  {
    quote: "The secret to being successful from a trading perspective is to have an indefatigable and an undying and unquenchable thirst for information and knowledge.",
    author: "Paul Tudor Jones",
    category: "discipline",
    lesson:
      "Continuous learning is non-negotiable in markets. The best traders are voracious students who never stop studying.",
  },
  {
    quote: "Do not be embarrassed by your failures, learn from them and start again.",
    author: "Richard Branson",
    category: "discipline",
    lesson:
      "Every trader experiences losses. What separates winners from losers is the willingness to analyze mistakes and improve the process.",
  },
  {
    quote: "If you can't take a small loss, sooner or later you will take the mother of all losses.",
    author: "Ed Seykota",
    category: "discipline",
    lesson:
      "Cutting losses quickly is essential for survival. A small, controlled loss is a normal cost of doing business. Refusing to take one can be catastrophic.",
  },
  {
    quote: "A lot of people with high IQs are terrible investors because they've got terrible temperaments.",
    author: "Charlie Munger",
    category: "discipline",
    lesson:
      "Intellectual ability alone does not ensure investment success. Discipline, patience, and emotional control are equally if not more important.",
  },
  {
    quote: "Plan your trade and trade your plan.",
    author: "Trading proverb",
    category: "discipline",
    lesson:
      "Having a written plan before entering a trade removes emotional decision-making. Deviating from your plan mid-trade is a common path to losses.",
  },
  {
    quote: "The market does not know you exist. You can do nothing to influence it. You can only control your behavior.",
    author: "Alexander Elder",
    category: "discipline",
    lesson:
      "Focus on what you can control: your entry, exit, position size, and emotional state. The market owes you nothing.",
  },
  {
    quote: "Amateurs think about how much money they can make. Professionals think about how much money they could lose.",
    author: "Jack Schwager",
    category: "discipline",
    lesson:
      "Risk management should always come before reward expectations. Defining your maximum acceptable loss before entering a trade is a professional habit.",
  },
  {
    quote: "The hard part is discipline, patience, and judgment. Investors need discipline to avoid the many unattractive pitches that are thrown.",
    author: "Seth Klarman",
    category: "discipline",
    lesson:
      "Not every opportunity deserves your capital. Saying no to marginal setups preserves capital for truly compelling ones.",
  },
  {
    quote: "It takes 20 years to build a reputation and five minutes to ruin it. If you think about that, you'll do things differently.",
    author: "Warren Buffett",
    category: "discipline",
    lesson:
      "Consistency and integrity matter in trading as in life. One reckless decision can erase years of disciplined gains.",
  },
  {
    quote: "Successful investing is about managing risk, not avoiding it.",
    author: "Benjamin Graham",
    category: "discipline",
    lesson:
      "Risk cannot be eliminated; it can only be understood, measured, and managed. Building robust risk frameworks is the foundation of longevity in markets.",
  },

  // Market
  {
    quote: "The market is never wrong; opinions often are.",
    author: "Jesse Livermore",
    category: "market",
    lesson:
      "Price is the ultimate arbiter. Fighting the tape based on personal conviction without confirming evidence is a losing strategy.",
  },
  {
    quote: "Bull markets are born on pessimism, grow on skepticism, mature on optimism, and die on euphoria.",
    author: "Sir John Templeton",
    category: "market",
    lesson:
      "Understanding the lifecycle of market cycles helps you position correctly. Each phase has distinct characteristics and appropriate strategies.",
  },
  {
    quote: "There is nothing new in Wall Street. There can't be because speculation is as old as the hills.",
    author: "Jesse Livermore",
    category: "market",
    lesson:
      "Market patterns repeat because human psychology does not change. Studying historical episodes provides insights applicable to current markets.",
  },
  {
    quote: "The market is a no-called-strike game. You don't have to swing at everything.",
    author: "Warren Buffett",
    category: "market",
    lesson:
      "Unlike baseball, there is no penalty for waiting. You can let hundreds of opportunities pass and only act when the odds are overwhelmingly in your favor.",
  },
  {
    quote: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
    category: "market",
    lesson:
      "A great company at the wrong price can be a terrible investment. Always consider whether the current price offers a margin of safety relative to intrinsic value.",
  },
  {
    quote: "I will tell you how to become rich. Close the doors. Be fearful when others are greedy. Be greedy when others are fearful.",
    author: "Warren Buffett",
    category: "market",
    lesson:
      "Contrarian positioning during extreme sentiment generates the best risk-adjusted returns over time.",
  },
  {
    quote: "The trend is your friend until the end when it bends.",
    author: "Ed Seykota",
    category: "market",
    lesson:
      "Trend following is a proven strategy, but all trends eventually reverse. Use trailing stops and recognize signs of trend exhaustion.",
  },
  {
    quote: "When the facts change, I change my mind. What do you do, sir?",
    author: "John Maynard Keynes",
    category: "market",
    lesson:
      "Intellectual flexibility is crucial. Clinging to a thesis after the underlying facts have changed is a common and costly mistake.",
  },
  {
    quote: "Behind every stock is a company. Find out what it's doing.",
    author: "Peter Lynch",
    category: "market",
    lesson:
      "Stocks are not abstract ticker symbols. They represent real businesses with products, customers, and competitive dynamics worth understanding.",
  },
  {
    quote: "Far more money has been lost by investors preparing for corrections, or trying to anticipate corrections, than has been lost in corrections themselves.",
    author: "Peter Lynch",
    category: "market",
    lesson:
      "Market timing is extremely difficult. Staying invested through volatility typically outperforms repeatedly moving to cash and trying to re-enter.",
  },
];

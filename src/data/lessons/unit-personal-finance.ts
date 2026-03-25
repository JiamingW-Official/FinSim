import type { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE: Unit = {
  id: "personal-finance",
  title: "Personal Finance",
  description: "Build wealth with budgeting, saving, and smart money habits",
  icon: "PiggyBank",
  color: "#f59e0b",
  lessons: [
    {
      id: "pf-budgeting",
      title: "The 50/30/20 Budget Rule",
      description: "Learn the most popular budgeting framework",
      icon: "PieChart",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "💰 Why Budgeting Matters",
          content:
            "Before you can invest, you need to know where your money goes. A **budget** is a plan for every dollar you earn. Without one, money disappears on things that don't matter to you.\n\nStudies show that people who budget are 2x more likely to reach their financial goals. It's the foundation of all wealth-building.",
          highlight: ["budget", "financial goals"],
        },
        {
          type: "teach",
          title: "📊 The 50/30/20 Rule",
          content:
            "Senator Elizabeth Warren popularized this simple framework:\n\n**50% Needs**: Rent, groceries, insurance, minimum debt payments — the essentials you can't skip.\n\n**30% Wants**: Dining out, entertainment, subscriptions, hobbies — things you enjoy but could live without.\n\n**20% Savings & Investing**: Emergency fund, retirement accounts, index funds, debt payoff above minimums.\n\nIf you earn $4,000/month: $2,000 for needs, $1,200 for wants, $800 for savings.",
          highlight: ["50/30/20", "needs", "wants", "savings"],
          visual: "portfolio-pie",
        },
        {
          type: "quiz-mc",
          question: "Under the 50/30/20 rule, which category does a gym membership fall into?",
          options: [
            "Wants (30%)",
            "Needs (50%)",
            "Savings (20%)",
            "It depends on your income",
          ],
          correctIndex: 0,
          explanation:
            "A gym membership is a 'want' — it's enjoyable and beneficial, but not strictly essential. You could exercise for free. This falls in the 30% category.",
        },
        {
          type: "quiz-tf",
          statement: "You should invest before building an emergency fund.",
          correct: false,
          explanation:
            "Financial experts recommend building 3-6 months of expenses in an emergency fund first. Without one, you might be forced to sell investments at a loss during an emergency.",
        },
        {
          type: "teach",
          title: "🎯 Pay Yourself First",
          content:
            "The most powerful budgeting trick: **automate your savings**. Set up automatic transfers on payday so savings happen before you can spend the money.\n\nThis is called 'paying yourself first' — treating savings like a bill that must be paid. People who automate save 3x more on average than those who rely on willpower alone.",
          highlight: ["pay yourself first", "automate"],
        },
      ],
    },
    {
      id: "pf-compound-interest",
      title: "The Magic of Compound Interest",
      description: "Understand the most powerful force in finance",
      icon: "TrendingUp",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "🚀 The 8th Wonder of the World",
          content:
            "Albert Einstein reportedly called compound interest 'the eighth wonder of the world.' Here's why:\n\n**Simple interest**: You earn interest only on your original amount.\n**Compound interest**: You earn interest on your interest too.\n\n$10,000 at 10% simple interest for 30 years = $40,000.\n$10,000 at 10% compound interest for 30 years = $174,494.\n\nThat's 4.3x more money — just by letting your returns reinvest!",
          highlight: ["compound interest", "simple interest"],
        },
        {
          type: "teach",
          title: "📐 The Rule of 72",
          content:
            "Want to know how long it takes to double your money? Divide **72** by your annual return rate.\n\nAt 7% returns (stock market average): 72 / 7 = ~10.3 years to double.\nAt 10% returns: 72 / 10 = ~7.2 years to double.\nAt 2% savings account: 72 / 2 = 36 years to double.\n\nThis is why investing in stocks historically beats savings accounts for long-term wealth building.",
          highlight: ["Rule of 72"],
        },
        {
          type: "quiz-mc",
          question: "At 8% annual returns, approximately how many years will it take to double your investment?",
          options: [
            "9 years",
            "4 years",
            "15 years",
            "20 years",
          ],
          correctIndex: 0,
          explanation:
            "Using the Rule of 72: 72 / 8 = 9 years. This quick mental math works surprisingly well for estimating compound growth.",
        },
        {
          type: "teach",
          title: "⏰ Time is Your Superpower",
          content:
            "The #1 advantage young investors have is **time**. Consider two investors:\n\n**Early Emily**: Invests $200/month from age 22 to 32 (10 years, $24,000 total), then stops.\n**Late Larry**: Invests $200/month from age 32 to 62 (30 years, $72,000 total).\n\nAt 8% returns, Emily ends up with MORE money at 62 ($508K vs $298K) despite investing 3x less — because her money had more time to compound.\n\nStarting early is more important than investing more.",
          highlight: ["time", "starting early"],
        },
        {
          type: "quiz-tf",
          statement: "Investing $200/month for 10 years starting at age 22 can yield more at age 62 than investing $200/month for 30 years starting at age 32.",
          correct: true,
          explanation:
            "This is the power of compounding! The 10 extra years of growth on Early Emily's investments more than compensate for Late Larry's 3x larger total contributions.",
        },
        {
          type: "quiz-scenario",
          scenario: "You receive a $5,000 bonus at work. You have no debt, a 3-month emergency fund, and contribute to your employer's 401k match.",
          question: "What's the most financially optimal use of this bonus?",
          options: [
            "Invest in a diversified index fund",
            "Put it all in a savings account",
            "Spend it on a vacation",
            "Buy individual stocks you heard about",
          ],
          correctIndex: 0,
          explanation:
            "With no debt, adequate emergency fund, and 401k match covered, a diversified index fund is optimal for long-term growth. A savings account loses to inflation, vacation has no financial return, and individual stock picks are risky without diversification.",
        },
      ],
    },
    {
      id: "pf-debt",
      title: "Good Debt vs Bad Debt",
      description: "Not all debt is created equal — learn the difference",
      icon: "CreditCard",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "🏦 Two Types of Debt",
          content:
            "**Good debt** helps you build wealth or increase earning power:\n- Mortgage (home typically appreciates)\n- Student loans (increases earning potential)\n- Business loans (generates income)\n\n**Bad debt** costs you money on depreciating assets:\n- Credit card debt (15-25% interest!)\n- Car loans on luxury vehicles\n- Payday loans (300%+ effective APR)\n\nThe key question: Does this debt help me earn more than it costs?",
          highlight: ["good debt", "bad debt", "APR"],
        },
        {
          type: "teach",
          title: "🔥 Debt Payoff Strategies",
          content:
            "Two proven methods to eliminate debt:\n\n**Avalanche Method**: Pay minimums on all debts, then throw extra money at the highest-interest debt first. This saves the most money mathematically.\n\n**Snowball Method**: Pay minimums on all debts, then throw extra money at the smallest balance first. This builds momentum through quick wins.\n\nBoth work — the avalanche saves more interest, but the snowball's psychological wins help many people stay motivated.",
          highlight: ["avalanche", "snowball"],
        },
        {
          type: "quiz-mc",
          question: "You have $500 extra per month. Which debt should you pay off first using the Avalanche method?",
          options: [
            "Credit card: $3,000 balance at 22% APR",
            "Car loan: $8,000 balance at 5% APR",
            "Student loan: $15,000 balance at 6% APR",
            "The smallest balance regardless of rate",
          ],
          correctIndex: 0,
          explanation:
            "The Avalanche method targets the highest interest rate first. The credit card at 22% APR costs you the most in interest, so paying it off first saves the most money overall.",
        },
        {
          type: "quiz-tf",
          statement: "A mortgage is always considered 'good debt' regardless of the terms.",
          correct: false,
          explanation:
            "Not all mortgages are good debt. An adjustable-rate mortgage you can barely afford, or a mortgage on a massively overpriced property, can be financially destructive. The terms, affordability, and local market matter.",
        },
      ],
    },
    {
      id: "pf-investing-basics",
      title: "Investing for Beginners",
      description: "Index funds, ETFs, and building your first portfolio",
      icon: "Landmark",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "📈 Why Invest at All?",
          content:
            "Cash loses value to **inflation** — about 3% per year. $100 today buys what $74 buys in 10 years.\n\nThe stock market has historically returned ~10% per year (7% after inflation). Investing is how you make your money grow faster than inflation eats it.\n\n**Not investing is the riskiest choice long-term** — you're guaranteed to lose purchasing power.",
          highlight: ["inflation", "purchasing power"],
        },
        {
          type: "teach",
          title: "🧺 Don't Put All Eggs in One Basket",
          content:
            "**Diversification** means spreading investments across many assets. If one company fails, your whole portfolio doesn't crash.\n\n**Index funds** make this easy — one fund holds hundreds of stocks. The S&P 500 index fund holds the 500 largest US companies.\n\n**ETFs** (Exchange-Traded Funds) are like index funds that trade like stocks. Popular ones: SPY (S&P 500), QQQ (Nasdaq 100), VTI (Total US Market).\n\nWarren Buffett recommends index funds for most people — even over his own company's stock!",
          highlight: ["diversification", "index funds", "ETF"],
        },
        {
          type: "quiz-mc",
          question: "What is the main advantage of an S&P 500 index fund?",
          options: [
            "Instant diversification across 500 large companies",
            "Guaranteed to never lose money",
            "Higher returns than any individual stock",
            "No fees at all",
          ],
          correctIndex: 0,
          explanation:
            "An S&P 500 index fund gives you exposure to 500 companies in one purchase. It can still lose money (it dropped 34% in 2020 before recovering), but diversification reduces the risk of any single company tanking your portfolio.",
        },
        {
          type: "teach",
          title: "💵 Dollar-Cost Averaging (DCA)",
          content:
            "**Dollar-cost averaging** means investing a fixed amount on a regular schedule — regardless of market conditions.\n\n$500/month every month, whether the market is up or down.\n\nWhen prices are high, you buy fewer shares. When prices are low, you buy more shares. Over time, this averages out your cost basis and removes the stress of trying to 'time the market.'\n\nStudies show DCA beats market timing for most investors because it eliminates emotional decision-making.",
          highlight: ["dollar-cost averaging", "DCA", "time the market"],
        },
        {
          type: "quiz-tf",
          statement: "Dollar-cost averaging means investing the same amount regularly regardless of market conditions.",
          correct: true,
          explanation:
            "Exactly! DCA removes emotion from investing. By investing consistently, you naturally buy more shares when prices are low and fewer when high, averaging your entry price over time.",
        },
        {
          type: "quiz-scenario",
          scenario: "You're 25 years old with a stable job, 6-month emergency fund, and no high-interest debt. You want to start investing $400/month.",
          question: "What's the best starting approach for a beginner?",
          options: [
            "Low-cost S&P 500 index fund via DCA",
            "Individual growth stocks you researched",
            "Cryptocurrency for maximum returns",
            "Wait for the next market crash to invest",
          ],
          correctIndex: 0,
          explanation:
            "For beginners, a low-cost S&P 500 index fund with monthly DCA is optimal: it's diversified, historically reliable (~10%/yr), low-fee, and removes timing risk. Individual stocks and crypto are higher risk, and waiting for crashes means missing growth.",
        },
      ],
    },
    {
      id: "pf-retirement",
      title: "Retirement Accounts & Tax Advantage",
      description: "401k, IRA, Roth — maximize your tax-advantaged growth",
      icon: "Shield",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "🏛️ Tax-Advantaged Accounts",
          content:
            "The government incentivizes saving for retirement through special accounts that offer tax benefits:\n\n**401(k)**: Employer-sponsored. Contributions reduce your taxable income TODAY. You pay taxes when you withdraw in retirement. Many employers match contributions — that's free money!\n\n**Traditional IRA**: Similar to 401(k) but you open it yourself. Tax deduction now, pay taxes later.\n\n**Roth IRA**: You pay taxes NOW on contributions, but all growth and withdrawals in retirement are TAX-FREE. Best for young people in low tax brackets.",
          highlight: ["401(k)", "IRA", "Roth IRA", "tax-free"],
        },
        {
          type: "teach",
          title: "🎁 The Employer Match",
          content:
            "If your employer offers a 401(k) match, **always contribute enough to get the full match**. It's literally free money.\n\nExample: Your employer matches 50% of contributions up to 6% of your salary. If you earn $60,000 and contribute 6% ($3,600), your employer adds $1,800. That's an instant 50% return on your money!\n\nNot taking the match is the same as turning down a raise. This should be your FIRST investment priority, even before paying off low-interest debt.",
          highlight: ["employer match", "free money"],
        },
        {
          type: "quiz-mc",
          question: "You earn $50,000/year. Your employer matches 100% of 401(k) contributions up to 3%. What's the minimum you should contribute?",
          options: [
            "3% ($1,500/year) to get the full $1,500 match",
            "Nothing — invest on your own instead",
            "The maximum allowed ($23,500 in 2025)",
            "1% is enough to get some match",
          ],
          correctIndex: 0,
          explanation:
            "At minimum, contribute 3% to capture the full employer match of $1,500. That's an immediate 100% return. Contributing nothing means leaving $1,500/year of free money on the table.",
        },
        {
          type: "quiz-tf",
          statement: "A Roth IRA is better than a Traditional IRA for someone in their 20s earning an entry-level salary.",
          correct: true,
          explanation:
            "Generally yes — young people are typically in lower tax brackets now than they will be in retirement. Paying taxes on contributions now (Roth) and getting tax-free growth for 40+ years is usually the better deal compared to deferring taxes to when you're in a higher bracket.",
        },
        {
          type: "teach",
          title: "📋 The Priority Checklist",
          content:
            "Financial experts recommend this investment priority order:\n\n1. **Emergency fund** (3-6 months expenses)\n2. **401(k) up to employer match** (free money!)\n3. **Pay off high-interest debt** (credit cards >10%)\n4. **Max out Roth IRA** ($7,000/year in 2025)\n5. **Max out 401(k)** ($23,500/year in 2025)\n6. **Taxable brokerage account** (for anything beyond)\n\nThis order maximizes tax advantages and minimizes interest costs. Follow it step by step.",
          highlight: ["priority", "emergency fund", "employer match"],
        },
      ],
    },
    {
      id: "pf-credit-score",
      title: "Understanding Credit Scores",
      description: "How credit works and why it matters for your financial life",
      icon: "Star",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "📊 What is a Credit Score?",
          content:
            "A **credit score** (300-850) is a number that tells lenders how risky you are as a borrower. Higher is better.\n\n**Excellent**: 750+ (best rates on everything)\n**Good**: 700-749 (most approvals, good rates)\n**Fair**: 650-699 (higher rates, some denials)\n**Poor**: Below 650 (limited options, high rates)\n\nYour credit score affects: mortgage rates, auto loans, credit card approvals, apartment rentals, and even some job applications.",
          highlight: ["credit score", "FICO"],
        },
        {
          type: "teach",
          title: "🔧 The 5 Factors",
          content:
            "**Payment History (35%)**: Never miss payments. One missed payment can drop your score 100+ points. Set up autopay for minimums at least.\n\n**Credit Utilization (30%)**: Use less than 30% of your credit limits. If your limit is $10,000, keep balances under $3,000.\n\n**Length of History (15%)**: Older accounts help. Don't close your oldest credit card.\n\n**Credit Mix (10%)**: Having different types (credit card, auto loan, etc.) helps slightly.\n\n**New Credit (10%)**: Too many applications in a short time hurts your score temporarily.",
          highlight: ["payment history", "utilization", "credit history"],
        },
        {
          type: "quiz-mc",
          question: "Which factor has the BIGGEST impact on your credit score?",
          options: [
            "Payment history (35%)",
            "Credit utilization (30%)",
            "Length of credit history (15%)",
            "Types of credit (10%)",
          ],
          correctIndex: 0,
          explanation:
            "Payment history makes up 35% of your FICO score — the single largest factor. One late payment (30+ days) can drop your score significantly and stays on your report for 7 years. Always pay at least the minimum on time.",
        },
        {
          type: "quiz-tf",
          statement: "Closing your oldest credit card will improve your credit score.",
          correct: false,
          explanation:
            "Closing your oldest card hurts your score in two ways: it shortens your average credit history (15% of score) and reduces your total available credit, increasing your utilization ratio (30% of score). Keep old cards open, even if you rarely use them.",
        },
      ],
    },
  ],
};

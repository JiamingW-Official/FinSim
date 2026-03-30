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
      title: "Budgeting, Debt & FIRE",
      description: "50/30/20, emergency funds, debt strategies, and financial independence",
      icon: "PieChart",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Why Budgeting Is the Foundation",
          content:
            "Before you can invest a single dollar, you need to know where your money goes. A **budget** is a plan that assigns every dollar a purpose.\n\nResearch from the National Endowment for Financial Education shows that people who budget are twice as likely to reach financial goals and carry 30% less consumer debt. Yet only 32% of American households maintain a budget.\n\nBudgeting is not about restriction -- it is about intentional allocation. Every dollar spent without a plan is a dollar that cannot compound for your future.",
          highlight: ["budget", "intentional allocation"],
        },
        {
          type: "teach",
          title: "The 50/30/20 Framework",
          content:
            "Senator Elizabeth Warren popularized this framework in 'All Your Worth':\n\n**50% Needs**: Housing, utilities, groceries, insurance, minimum debt payments, transportation. These are obligations you cannot skip.\n\n**30% Wants**: Dining out, entertainment, subscriptions, hobbies, travel. Things that improve quality of life but are not survival necessities.\n\n**20% Savings & Debt Payoff**: Emergency fund, retirement contributions (401k/IRA), index fund investing, extra debt payments above minimums.\n\nOn $5,000/month take-home:\n- Needs: $2,500 (rent, groceries, car, insurance)\n- Wants: $1,500 (dining, streaming, gym, hobbies)\n- Savings: $1,000 (401k, Roth IRA, brokerage)\n\nThis framework is a starting point. High earners should target 30-50% savings rate. Low earners may need 60-70% on needs initially.",
          visual: "portfolio-pie",
          highlight: ["50/30/20", "needs", "wants", "savings"],
        },
        {
          type: "quiz-mc",
          question:
            "Under the 50/30/20 framework, which of the following is classified as a 'need'?",
          options: [
            "Minimum payment on your student loan",
            "Netflix subscription",
            "Gym membership",
            "Dining out with friends",
          ],
          correctIndex: 0,
          explanation:
            "**Minimum debt payments** are a 'need' because failure to pay results in default, credit damage, and legal consequences. Netflix, gym, and dining are all 'wants' -- enjoyable but not legally or survival-required. Note: extra payments ABOVE the minimum count as 'savings/debt payoff' (the 20% bucket).",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The Emergency Fund",
          content:
            "An **emergency fund** is liquid cash (high-yield savings account, not invested) covering 3-6 months of essential expenses.\n\n**Why 3-6 months?** The average job search in the US takes 3-5 months. Medical emergencies, car repairs, and housing issues can cost thousands unexpectedly.\n\n**Where to keep it**: High-yield savings account (4-5% APY currently), NOT invested in stocks. The purpose is guaranteed availability, not growth.\n\n**How to build it**: Target $1,000 'starter' emergency fund first (covers most minor emergencies), then build to full 3-6 months.\n\n**Who needs more**: Freelancers, single-income households, and those in volatile industries should target 6-12 months. Dual-income, stable-job households can lean toward 3 months.\n\nWithout an emergency fund, any surprise expense forces you to sell investments at potentially the worst time or take on high-interest debt.",
          highlight: ["emergency fund", "high-yield savings", "liquid cash"],
        },
        {
          type: "quiz-tf",
          statement:
            "You should invest your emergency fund in an S&P 500 index fund for higher returns.",
          correct: false,
          explanation:
            "An emergency fund must be **liquid and stable**. The S&P 500 dropped 34% in March 2020 -- imagine needing your emergency fund during a crash and finding it has lost a third of its value. A high-yield savings account (4-5% APY) provides guaranteed availability with no market risk. The lower return is the cost of insurance against forced liquidation at the worst time.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Debt Avalanche vs Debt Snowball",
          content:
            "Two proven strategies for eliminating debt:\n\n**Debt Avalanche**: Pay minimums on all debts, then throw every extra dollar at the **highest interest rate** debt first.\n- Saves the most money in total interest paid\n- Mathematically optimal\n- Example order: Credit card 22% -> Personal loan 12% -> Car 5% -> Student loan 4%\n\n**Debt Snowball**: Pay minimums on all debts, then throw every extra dollar at the **smallest balance** first.\n- Creates quick psychological wins (accounts closed sooner)\n- Builds momentum and motivation\n- Harvard research found snowball users are more likely to finish paying off all debts\n\n**Which to choose?** If you are disciplined and motivated by math, use avalanche. If you need motivational wins to stay on track, use snowball. A completed snowball beats an abandoned avalanche.",
          highlight: ["debt avalanche", "debt snowball"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have $500/month extra after minimums. Your debts:\n- Credit card A: $1,200 balance, 24% APR\n- Credit card B: $4,500 balance, 18% APR\n- Car loan: $8,000 balance, 5% APR\n- Student loan: $22,000 balance, 6% APR",
          question: "Using the Debt Avalanche method, which debt do you attack first?",
          options: [
            "Credit card A ($1,200 at 24% APR) -- highest interest rate",
            "Student loan ($22,000) -- largest balance",
            "Car loan ($8,000 at 5%) -- most manageable",
            "Credit card B ($4,500 at 18%) -- moderate balance",
          ],
          correctIndex: 0,
          explanation:
            "The **avalanche method** targets the highest APR first: Credit card A at 24%. At $500/month extra, this $1,200 balance is eliminated in ~2.5 months, then you redirect $500/month to Credit card B (18%), then car loan (5%), then student loan (6%). Total interest savings vs snowball: approximately $800-1,200 over the payoff period.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Pay Yourself First: Automating Wealth",
          content:
            "The most powerful budgeting principle: **Pay yourself first**. Treat savings like a non-negotiable bill paid on every payday.\n\nImplementation:\n1. Set up automatic transfer on payday: checking -> savings/investment account\n2. Start with 10% of take-home pay; increase by 1% every raise\n3. Never see the money in your spending account\n\nPeople who automate savings accumulate **3x more wealth** over a decade compared to those who 'save what's left.' Behavioral economics explains why: willpower is a depletable resource, but automated systems bypass willpower entirely.\n\n**Savings rate is the single biggest lever for building wealth.** A person saving 50% of income achieves financial independence in ~17 years. Someone saving 10% takes ~50+ years.",
          highlight: ["pay yourself first", "automate", "savings rate"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the MOST effective way to increase your savings rate over time?",
          options: [
            "Automatically increase contributions by 1% with every raise (never see the difference)",
            "Manually move money at month-end if anything is left",
            "Wait until you earn more money before starting to save",
            "Put savings in a checking account for easy access",
          ],
          correctIndex: 0,
          explanation:
            "Automatically escalating contributions with raises is the most effective approach because: (1) you never experience a lifestyle reduction, (2) it bypasses the willpower problem, and (3) over 10 years of 3% annual raises, a 1% annual increase takes your savings rate from 10% to 20% without feeling any different. This technique is used in most 401(k) auto-escalation programs.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "The FIRE Movement",
          content:
            "**FIRE** (Financial Independence, Retire Early) is built on a simple principle: save aggressively, invest in index funds, and live off the returns once your portfolio reaches 25x annual expenses.\n\n**The 4% Rule** (Trinity Study): If you withdraw 4% of your portfolio in year one and adjust for inflation thereafter, your money has a 95% probability of lasting 30+ years.\n\n25x annual expenses = FIRE number.\n- Spend $40K/year -> need $1M\n- Spend $60K/year -> need $1.5M\n- Spend $100K/year -> need $2.5M\n\n**FIRE variants**:\n- **Lean FIRE**: Frugal lifestyle, ~$30-40K/year expenses\n- **Fat FIRE**: Comfortable lifestyle, ~$80-120K/year expenses\n- **Barista FIRE**: Partial retirement, working part-time to cover some expenses while portfolio grows\n- **Coast FIRE**: Enough invested that compound growth alone will fund retirement at 65, even with no new contributions",
          highlight: ["FIRE", "4% Rule", "25x expenses"],
        },
        {
          type: "quiz-mc",
          question:
            "Your annual expenses are $50,000. Using the 4% rule, what is your FIRE number (minimum portfolio to retire)?",
          options: [
            "$1,250,000",
            "$500,000",
            "$2,000,000",
            "$750,000",
          ],
          correctIndex: 0,
          explanation:
            "FIRE number = Annual Expenses x 25 = $50,000 x 25 = **$1,250,000**. At 4% withdrawal: $1,250,000 x 0.04 = $50,000/year. The Trinity Study showed this has a ~95% success rate over 30 years assuming a 60/40 stock/bond allocation. Reducing expenses is twice as powerful as increasing income because it lowers your target AND increases savings.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The fastest path to financial independence is always to earn more money.",
          correct: false,
          explanation:
            "Reducing expenses is mathematically more powerful because it has a **dual effect**: it simultaneously increases savings AND decreases the target portfolio needed. Cutting $10,000 in annual expenses saves $10,000/year AND reduces your FIRE number by $250,000 (at 25x). To achieve the same effect through income, you would need to earn roughly $15,000 more (accounting for taxes), and your FIRE target does not decrease.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Alex earns $75,000/year take-home. Currently spends $65,000/year (saving $10K, or 13%). By cutting unnecessary subscriptions, dining out less, and downsizing an apartment, Alex reduces expenses to $50,000/year.",
          question: "How does this change Alex's path to financial independence?",
          options: [
            "Savings rate jumps to 33%, FIRE number drops from $1.625M to $1.25M -- roughly 15 years faster",
            "Minimal impact -- still earning the same salary",
            "Negative impact -- lower quality of life reduces motivation",
            "Only changes the timeline by 1-2 years",
          ],
          correctIndex: 0,
          explanation:
            "Savings jumps from $10K/year to $25K/year (2.5x). FIRE target drops from $1.625M ($65K x 25) to $1.25M ($50K x 25). Combined: 2.5x more savings toward a 23% lower target. At 7% real returns, timeline drops from ~40 years to ~25 years. The $15K expense cut is far more impactful than a $15K raise because it attacks both sides of the equation.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Complete Financial Priority Stack",
          content:
            "CFP-recommended order of financial priorities:\n\n1. **Starter emergency fund** ($1,000)\n2. **Employer 401(k) match** (free money -- instant 50-100% return)\n3. **Eliminate high-interest debt** (credit cards >10% APR)\n4. **Full emergency fund** (3-6 months expenses)\n5. **Max Roth IRA** ($7,000/year in 2025)\n6. **Max 401(k)** ($23,500/year in 2025)\n7. **HSA** if eligible ($4,150 individual / $8,300 family -- triple tax advantage)\n8. **Taxable brokerage account** (index funds for anything beyond)\n9. **Pay off low-interest debt** (student loans, mortgage)\n\nFollow this order to maximize tax advantages and minimize interest costs. Each step builds on the previous one.",
          highlight: ["financial priority stack", "HSA", "triple tax advantage"],
        },
      ],
    },
    {
      id: "pf-compound-interest",
      title: "Compound Interest & Time Value of Money",
      description: "The compound interest formula, Rule of 72, DCA, and tax-advantaged accounts",
      icon: "TrendingUp",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Simple vs Compound Interest",
          content:
            "**Simple interest** accrues only on the original principal:\nA = P x (1 + r x t)\n$10,000 at 10% for 30 years = $10,000 x (1 + 0.10 x 30) = **$40,000**\n\n**Compound interest** accrues on principal PLUS accumulated interest:\n**A = P(1 + r/n)^(nt)**\n\nWhere:\n- A = final amount\n- P = principal ($10,000)\n- r = annual rate (0.10)\n- n = compounding frequency per year (12 for monthly)\n- t = years (30)\n\n$10,000 at 10% compounded monthly for 30 years:\nA = $10,000(1 + 0.10/12)^(12x30) = $10,000(1.00833)^360 = **$198,374**\n\nThe difference: $198,374 vs $40,000. Compound interest generated nearly **5x more wealth** than simple interest on the same principal.",
          highlight: ["compound interest", "A = P(1+r/n)^(nt)"],
        },
        {
          type: "quiz-mc",
          question:
            "You invest $5,000 at 8% annual interest compounded annually. What is the value after 10 years?",
          options: [
            "$10,795 [A = 5000(1.08)^10]",
            "$9,000 [simple interest: 5000 + 5000x0.08x10]",
            "$13,000",
            "$8,000",
          ],
          correctIndex: 0,
          explanation:
            "A = P(1 + r/n)^(nt) = $5,000(1 + 0.08/1)^(1x10) = $5,000(1.08)^10 = $5,000 x 2.159 = **$10,795**. Compare to simple interest: $5,000 + ($5,000 x 0.08 x 10) = $9,000. Compounding earned an extra $1,795 on a $5,000 investment over just 10 years.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Rule of 72",
          content:
            "The **Rule of 72** is a mental math shortcut: divide 72 by your annual return to estimate years to double your money.\n\n**Years to Double = 72 / Annual Return (%)**\n\n- At 4% (bonds): 72/4 = **18 years**\n- At 7% (stocks after inflation): 72/7 = **~10.3 years**\n- At 10% (stocks nominal): 72/10 = **7.2 years**\n- At 12% (aggressive growth): 72/12 = **6 years**\n- At 24% (credit card debt against you): 72/24 = **3 years** to double what you owe\n\nThe Rule of 72 also reveals the devastating cost of fees. A 2% annual fee vs 0.1% fee: your money doubles in 36 years vs 7.2 years for the 'missing' 1.9%. Over 30 years, a 2% fee can consume 40%+ of your final wealth.",
          highlight: ["Rule of 72", "fees"],
        },
        {
          type: "quiz-mc",
          question:
            "At 6% annual returns, approximately how many times will $10,000 double in 36 years?",
          options: [
            "3 times (doubling every 12 years) -> ~$80,000",
            "2 times -> ~$40,000",
            "6 times -> ~$640,000",
            "1 time -> ~$20,000",
          ],
          correctIndex: 0,
          explanation:
            "72/6 = **12 years per doubling**. In 36 years: 36/12 = **3 doublings**. $10,000 -> $20,000 -> $40,000 -> **$80,000**. Actual calculation: $10,000 x (1.06)^36 = $81,473. The Rule of 72 approximation is remarkably accurate for quick mental math.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Time Value of Money (TVM)",
          content:
            "The **Time Value of Money** is the core principle of all finance: a dollar today is worth more than a dollar tomorrow.\n\nWhy? Because today's dollar can be invested and earn returns.\n\n**Present Value (PV)**: What is a future payment worth today?\nPV = FV / (1 + r)^t\n\n$10,000 received in 10 years at 7% discount rate:\nPV = $10,000 / (1.07)^10 = $10,000 / 1.967 = **$5,083**\n\nThis means you'd be indifferent between $5,083 today and $10,000 in 10 years (at 7%).\n\n**Practical TVM applications**:\n- Comparing job offers with different bonus structures\n- Evaluating whether to pay off a loan early vs invest\n- Deciding between lump-sum and annuity payments\n- Understanding why inflation erodes purchasing power",
          highlight: ["time value of money", "present value", "future value"],
        },
        {
          type: "quiz-tf",
          statement:
            "Receiving $50,000 today is always better than receiving $70,000 in 5 years.",
          correct: false,
          explanation:
            "It depends on the **discount rate** (your available investment returns). At 7%: PV of $70K in 5 years = $70,000 / (1.07)^5 = **$49,918** -- nearly identical, so $70K in 5 years is slightly worse. At 5%: PV = $70,000 / (1.05)^5 = **$54,839** -- the future payment is worth more. You need to compare present values using your personal discount rate (opportunity cost of capital).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Power of Starting Early",
          content:
            "Time is the single most powerful variable in the compound interest formula. Consider two investors:\n\n**Early Emma**: Invests $500/month from age 22 to 32 (10 years, $60,000 total contributed), then stops completely.\n\n**Late Larry**: Invests $500/month from age 32 to 62 (30 years, $180,000 total contributed).\n\nAt 8% annual returns by age 62:\n- Emma: **$787,180** (invested 3x less)\n- Larry: **$745,180** (invested 3x more)\n\nEmma contributed $60K and earned $727K in growth. Larry contributed $180K and earned $565K in growth. Emma's 10-year head start generated more wealth than Larry's 30 years of contributions.\n\n**Every year you delay investing costs you far more than the amount you would have invested.**",
          highlight: ["starting early", "time in market"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Two friends graduate college at 22. Sarah immediately starts investing $300/month. Jake waits until age 32 and then invests $600/month (double Sarah's amount) to 'catch up.' Both earn 8% annually and invest until 62.",
          question: "Who has more at age 62?",
          options: [
            "Sarah: ~$1.05M vs Jake's ~$895K -- despite investing half as much per month",
            "Jake: double the monthly amount means he catches up",
            "They end up with roughly the same amount",
            "Jake: $600/month for 30 years always beats $300/month for 40 years",
          ],
          correctIndex: 0,
          explanation:
            "Sarah: $300/month x 40 years at 8% = ~**$1,054,000** (total contributed: $144,000). Jake: $600/month x 30 years at 8% = ~**$895,000** (total contributed: $216,000). Sarah invested $72,000 LESS but ended with $159,000 MORE. Her 10 extra years of compounding outweighed Jake's doubled contribution. **Time beats money.**",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Dollar-Cost Averaging (DCA)",
          content:
            "**Dollar-cost averaging** means investing a fixed dollar amount on a regular schedule, regardless of market conditions.\n\n$500/month every month, whether the market is up, down, or sideways.\n\n**How DCA works mathematically**:\n- Month 1: $500 buys 10 shares at $50\n- Month 2: $500 buys 12.5 shares at $40 (market dipped)\n- Month 3: $500 buys 8.33 shares at $60 (market recovered)\n- Average cost: $48.39/share (lower than the average price of $50)\n\nDCA automatically buys more shares when prices are low and fewer when prices are high. Over time, your average cost basis tends to be lower than the average market price.\n\n**DCA vs lump sum**: Research shows lump-sum investing beats DCA ~67% of the time (because markets trend upward). But DCA reduces emotional risk and is the practical reality for most people who invest from paychecks.",
          highlight: ["dollar-cost averaging", "DCA", "average cost basis"],
        },
        {
          type: "quiz-tf",
          statement:
            "Dollar-cost averaging guarantees you will never lose money in the stock market.",
          correct: false,
          explanation:
            "DCA does NOT guarantee profits. It reduces the risk of buying entirely at a market peak and lowers your average cost basis over time, but if the market enters a prolonged decline, your portfolio will still show losses. DCA is a **risk reduction strategy**, not a profit guarantee. Its primary benefit is removing the emotional paralysis of trying to time the market.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Tax-Advantaged Accounts",
          content:
            "The government provides powerful tax incentives for retirement saving:\n\n**Traditional 401(k) / IRA**: Tax-deductible contributions. Grows tax-deferred. Pay ordinary income tax on withdrawals in retirement.\n- Best if: your current tax rate is HIGHER than your expected retirement tax rate.\n\n**Roth 401(k) / Roth IRA**: Contributions are after-tax (no deduction). Grows tax-free. Withdrawals in retirement are **completely tax-free**.\n- Best if: your current tax rate is LOWER than your expected retirement rate (young earners).\n\n**HSA** (Health Savings Account): Triple tax advantage -- tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses. After age 65, non-medical withdrawals are taxed like a Traditional IRA. Often called the 'stealth IRA.'\n\n**The tax drag on a $10,000 investment at 8% over 30 years**:\n- Taxable account (25% on gains): ~$64,000\n- Tax-deferred (Traditional): ~$100,627\n- Tax-free (Roth): ~$100,627 (no tax on withdrawal)\n\nThe difference is tens of thousands of dollars from the same investment.",
          highlight: ["401(k)", "Roth IRA", "HSA", "tax-advantaged"],
        },
        {
          type: "quiz-mc",
          question:
            "A 25-year-old earning $45,000/year (in the 12% tax bracket) expects to earn $150,000+ in retirement. Should they prioritize Roth or Traditional contributions?",
          options: [
            "Roth -- pay 12% tax now to avoid 24%+ tax on withdrawals in retirement",
            "Traditional -- always defer taxes as long as possible",
            "Neither -- invest in a taxable brokerage account instead",
            "Split 50/50 between both",
          ],
          correctIndex: 0,
          explanation:
            "At 12% marginal tax rate now vs 24%+ expected in retirement, the math strongly favors **Roth**. Pay 12 cents in tax per dollar today to receive that dollar (plus decades of growth) completely tax-free. A $7,000 Roth IRA contribution costs $840 in taxes today. At 8% growth over 40 years, that $7,000 becomes ~$152,000 -- all tax-free. In a Traditional account, that $152,000 withdrawal would be taxed at ~24%, costing ~$36,500.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You earn $80,000/year. Your employer matches 50% of 401(k) contributions up to 6%. You currently contribute 0% to your 401(k) and have $3,000 in credit card debt at 22% APR.",
          question: "What should be your immediate financial priority?",
          options: [
            "Contribute 6% to 401(k) to capture the full match while paying minimums on the card",
            "Pay off the credit card entirely before contributing anything to 401(k)",
            "Max out the 401(k) at $23,500/year",
            "Invest in individual stocks for higher returns",
          ],
          correctIndex: 0,
          explanation:
            "The employer match is an instant 50% return on your money -- no investment can match that. At 6% of $80K = $4,800 contributed, you receive $2,400 in free money. While 22% APR is painful, the $3,000 balance costs ~$660/year in interest, while the match gives you $2,400/year. The correct sequence: (1) contribute 6% for the match, (2) aggressively pay off the card with remaining budget, (3) then increase contributions.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Cost of Waiting and the Cost of Fees",
          content:
            "**Two wealth destroyers most people ignore:**\n\n**1. Waiting to invest**: Each year you delay costs exponentially more.\n- Delaying from 25 to 26 (1 year): costs ~$100K by age 65 (at $500/month, 8%)\n- Delaying from 25 to 35 (10 years): costs ~$600K by age 65\n\n**2. High investment fees**: The difference between 0.03% (Vanguard VTI) and 1.5% (typical active fund) is enormous.\n- $10,000 at 8% gross, 0.03% fee for 30 years: **$97,869**\n- $10,000 at 8% gross, 1.5% fee for 30 years: **$65,001**\n- The 1.47% fee difference consumed **$32,868** -- a third of your wealth\n\nAlways check the **expense ratio** of any fund. For index funds, anything above 0.20% is too high. For the S&P 500, you should pay 0.03-0.10%.",
          highlight: ["expense ratio", "cost of waiting", "fee drag"],
        },
        {
          type: "quiz-mc",
          question:
            "Fund A has an expense ratio of 0.04%. Fund B charges 1.2%. Both track the S&P 500. On a $100,000 investment over 30 years at 10% gross return, approximately how much more will Fund A be worth?",
          options: [
            "~$500,000 more (fees compound against you just like returns compound for you)",
            "~$35,000 more (the fee difference is small)",
            "~$10,000 more",
            "No difference -- both track the same index",
          ],
          correctIndex: 0,
          explanation:
            "Fund A: $100K at 9.96% net for 30 years = ~**$1,720,000**. Fund B: $100K at 8.8% net for 30 years = ~**$1,220,000**. The 1.16% fee difference costs approximately **$500,000** over 30 years. Fees compound against you with the same exponential force that returns compound for you. This is why index fund investing with minimal fees is the single highest-impact financial decision most people can make.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Using the Rule of 72, money invested at 9% annual return will double approximately every 8 years.",
          correct: true,
          explanation:
            "72 / 9 = **8 years per doubling**. $10,000 at 9% doubles to $20K at age 30 (if started at 22), $40K at 38, $80K at 46, $160K at 54, $320K at 62 -- five doublings over 40 years from a single $10,000 investment. The Rule of 72 is a quick and remarkably accurate approximation for compound growth mental math.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Putting It All Together: The Wealth Equation",
          content:
            "Building wealth is not complicated. It requires executing a simple system consistently:\n\n**1. Earn** -> Maximize income through skills, career development, side income\n**2. Save** -> Automate 20%+ of take-home pay (pay yourself first)\n**3. Invest** -> Low-cost index funds in tax-advantaged accounts (401k match first, then Roth IRA, then max 401k)\n**4. Compound** -> Never withdraw. Let time and compound interest do the heavy lifting. Reinvest all dividends.\n**5. Protect** -> Emergency fund, insurance, diversification\n\n**The three variables**: Savings rate, return rate, and time. You control savings rate (highest impact). The market determines returns (~7-10% historically). Time is your most scarce and valuable resource -- every year counts.\n\nStart today. The best time to start investing was 10 years ago. The second best time is now.",
          highlight: ["wealth equation", "savings rate", "compound"],
        },
      ],
    },
  ],
};

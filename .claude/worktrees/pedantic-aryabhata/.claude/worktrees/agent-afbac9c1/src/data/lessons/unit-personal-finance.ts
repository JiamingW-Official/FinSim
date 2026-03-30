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
    /* ================================================================
       LESSON 3 — Emergency Fund Fundamentals
       ================================================================ */
    {
      id: "pf-emergency-fund",
      title: "Emergency Fund Fundamentals",
      description: "3-6 months of expenses, where to keep it, and how to build it step by step",
      icon: "Shield",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "What an Emergency Fund Is (and Is Not)",
          content:
            "An **emergency fund** is a dedicated pool of liquid cash set aside exclusively for genuine financial emergencies: job loss, medical crisis, major car repair, urgent home repair.\n\nIt is NOT:\n- A vacation fund\n- A down payment fund\n- An investment account\n- Money sitting idle doing nothing\n\nThe emergency fund's purpose is **insurance against forced liquidation**. Without it, any surprise expense forces you to either sell investments at potentially the worst moment (market down 30%) or take on high-interest debt (credit cards at 20-25% APR).\n\nFEMA data shows 60% of Americans would struggle to cover a $1,000 emergency expense. Federal Reserve surveys confirm 40% cannot cover a $400 unexpected expense without borrowing. An emergency fund is the single most important financial foundation.",
          highlight: ["emergency fund", "insurance against forced liquidation", "liquid cash"],
        },
        {
          type: "teach",
          title: "How Much to Save: The 3-6 Month Rule",
          content:
            "Target **3 to 6 months of essential expenses** -- not income, but the minimum you need to survive.\n\n**Essential expenses only**: Rent/mortgage, utilities, groceries, insurance premiums, minimum debt payments, transportation to work. Exclude dining out, subscriptions, entertainment.\n\n**Who needs 3 months**: Dual-income households, government employees, highly specialized professionals with low layoff risk, those with very stable employment.\n\n**Who needs 6+ months**:\n- Single-income households\n- Freelancers and self-employed individuals\n- Commission-based workers with volatile income\n- Those in cyclical industries (construction, real estate, finance)\n- People with dependents (children, elderly parents)\n- Anyone with significant health issues or chronic illness\n\n**Example calculation**: Monthly essentials $3,200 (rent $1,800, groceries $400, utilities $200, car $300, insurance $300, minimums $200). Target: $9,600 (3 months) to $19,200 (6 months).\n\nStart with a $1,000 starter emergency fund to handle most minor emergencies while paying down high-interest debt.",
          highlight: ["3-6 months", "essential expenses", "starter emergency fund"],
        },
        {
          type: "quiz-mc",
          question:
            "A freelance graphic designer with one client generating $6,000/month has monthly essential expenses of $3,500. What is the appropriate emergency fund target?",
          options: [
            "$21,000 (6 months) -- freelancer with single-client concentration risk",
            "$10,500 (3 months) -- stable income stream",
            "$3,500 (1 month) -- frugal minimum",
            "$42,000 (12 months) -- maximum safety",
          ],
          correctIndex: 0,
          explanation:
            "Freelancers face two compounding risks: income volatility AND client concentration. If this single client leaves, income drops to zero immediately. Six months ($21,000) provides enough runway to find new clients (average 2-4 months) plus a buffer for unexpected expenses during the search. Dual-income salaried employees might get by with 3 months, but a single-client freelancer has essentially the highest job-loss risk of any working arrangement.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Where to Keep Your Emergency Fund",
          content:
            "The emergency fund must satisfy two requirements: **guaranteed availability** and **no market risk**. Acceptable locations:\n\n**High-Yield Savings Account (HYSA)**: Best option. FDIC-insured up to $250,000. Currently paying 4-5% APY. Transfers to checking in 1-2 business days. Examples: Marcus by Goldman Sachs, Ally, SoFi, Discover Savings.\n\n**Money Market Account**: Similar to HYSA, often with check-writing and debit card access. Slightly more convenient but comparable yields.\n\n**Treasury Bills (T-Bills)**: 4-week or 13-week T-Bills yielding ~5%+. Backed by US government. Slight access friction (must sell/wait for maturity). Acceptable for the portion beyond $1,000 immediate-access buffer.\n\n**Not acceptable**:\n- Stock market or index funds (could be down 40% when you need it)\n- CDs with early withdrawal penalties (reduces liquidity)\n- Money market funds (not FDIC-insured, though very safe)\n- Crypto (extreme volatility)\n- Cash at home (no interest, theft/fire risk)\n\nThe 4-5% yield on a $15,000 emergency fund generates $600-750/year. Not zero.",
          highlight: ["HYSA", "FDIC-insured", "high-yield savings", "money market"],
        },
        {
          type: "quiz-tf",
          statement:
            "An S&P 500 index fund is an acceptable place to keep your emergency fund because historically it returns 10% per year, far exceeding the 4-5% of a savings account.",
          correct: false,
          explanation:
            "An emergency fund requires **guaranteed availability at stable value**. The S&P 500 dropped 34% in 5 weeks (Feb-March 2020), 57% in the 2008-2009 financial crisis, and 49% in the 2000-2002 dot-com crash. Emergencies often coincide with recessions (job losses spike during downturns). Needing your emergency fund during a 40% market decline means selling at the worst possible time and locking in permanent losses. The lower return on HYSA is the explicit, intentional cost of insurance.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria has $800 in savings, $3,200/month in essential expenses, and $4,500 in credit card debt at 21% APR. She receives a $3,000 tax refund.",
          question: "How should Maria allocate the $3,000 tax refund?",
          options: [
            "$200 to reach $1,000 starter fund, $2,800 to credit card -- then aggressively attack remaining $1,700 in debt",
            "All $3,000 to credit card -- eliminate the debt first, then build emergency fund",
            "All $3,000 to savings -- emergency fund before all debt",
            "Split $1,500 each to savings and credit card",
          ],
          correctIndex: 0,
          explanation:
            "Complete the $1,000 starter fund first ($200 brings $800 to $1,000). This protects against minor emergencies that would force new credit card charges (defeating the debt payoff). Then apply $2,800 to the credit card, reducing it to $1,700 at 21% APR. The remaining $1,700 in debt should be eliminated in 3-4 months before building the full 3-6 month fund. Putting all $3K to credit card without any emergency fund means the first $500 car repair goes straight back on the card.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 4 — Investing vs Speculating
       ================================================================ */
    {
      id: "pf-investing-vs-speculating",
      title: "Investing vs Speculating",
      description: "Time horizons, risk tolerance, asset classes, and defining your financial purpose",
      icon: "Scale",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Core Distinction",
          content:
            "**Investing** and **speculating** are fundamentally different activities, though they use the same tools (stocks, bonds, commodities, crypto).\n\n**Investing**: Deploying capital with the expectation of returns generated by underlying business value, income (dividends, interest), or long-term asset appreciation. The primary driver of return is the economic productivity of the asset.\n- Buying an S&P 500 index fund held for 20 years\n- Purchasing rental property for cash flow\n- Buying bonds for fixed income\n\n**Speculating**: Attempting to profit from price movements driven by supply/demand imbalances, sentiment shifts, or momentum, often over short time horizons. The primary driver of return is someone else paying a higher price.\n- Day trading individual stocks\n- Buying meme coins expecting price appreciation\n- Short-term options plays\n\nNeither is inherently wrong, but conflating them is dangerous. Many people think they are investing when they are speculating, which leads to decisions inconsistent with their actual risk tolerance and time horizon.",
          highlight: ["investing", "speculating", "time horizon", "underlying value"],
        },
        {
          type: "teach",
          title: "Time Horizons and Risk Tolerance",
          content:
            "**Time horizon** is the most important determinant of appropriate investment strategy.\n\n**Short-term (0-3 years)**: This money should NOT be in the stock market. Use HYSA, CDs, T-Bills, short-term bond funds. A 30% market decline before a house purchase is a catastrophe.\n\n**Medium-term (3-7 years)**: Moderate allocation appropriate. 50-70% equities, 30-50% bonds/stable assets. Enough time to potentially recover from a 40% crash but not guaranteed.\n\n**Long-term (7+ years)**: High equity allocation appropriate. Historical data shows the US stock market has never had a negative 20-year period. Time allows recovery from crashes and full capture of compound growth.\n\n**Risk tolerance**: Separate from time horizon, this is your psychological ability to hold through downturns without panic-selling. A 40% portfolio decline means a $100K portfolio falls to $60K. If seeing that figure would cause you to sell, you have taken on too much risk regardless of your time horizon.\n\n**True risk tolerance test**: Can you watch your portfolio drop 40% and not only hold, but continue buying? If yes, you are a high-risk tolerance investor. Most people overestimate their risk tolerance in bull markets.",
          highlight: ["time horizon", "risk tolerance", "short-term", "long-term"],
        },
        {
          type: "quiz-tf",
          statement:
            "A 30-year-old saving for retirement in 35 years should keep most of their portfolio in bonds because they are safer than stocks.",
          correct: false,
          explanation:
            "With a 35-year horizon, the primary risk is NOT short-term volatility but **inflation erosion and insufficient growth**. Bonds historically return 2-4% real after inflation. Stocks return approximately 7% real. Over 35 years at 7% vs 3.5%: $10,000 becomes $106K vs $33K. For long-horizon investors, the biggest risk is actually being too conservative. Bonds are appropriate as a time horizon shortens (within 5-10 years of needing the money). A 30-year-old in 100% bonds is likely to run out of money in retirement.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Asset Classes and Their Roles",
          content:
            "Every portfolio is built from combinations of asset classes, each with different risk/return profiles:\n\n**Equities (Stocks)**: Ownership in businesses. Highest long-term return (~10% nominal, ~7% real). Highest volatility. Drawdowns of 20-57% are historical norms in crashes. Essential for wealth building over long horizons.\n\n**Fixed Income (Bonds)**: Loans to governments or corporations. Lower return (~2-5%), lower volatility. Provides stability and income. Crucial as retirement approaches.\n\n**Real Estate**: Physical property or REITs. Long-term returns similar to stocks with inflation protection. High entry cost, illiquidity. REITs provide stock-like liquidity.\n\n**Commodities**: Raw materials (oil, gold, copper, agriculture). Low long-term real returns but hedge against inflation and provide diversification. Gold: store of value, no yield. Commodities generally do not compound.\n\n**Cash and Cash Equivalents**: T-Bills, HYSA, money market. Stable value, current yield 4-5%. Purchasing power erodes at inflation rate over the long term.\n\n**Alternative Assets**: Private equity, hedge funds, crypto, collectibles. Variable risk/return. Most individual investors should avoid unless they understand the specific risks deeply.",
          highlight: ["equities", "fixed income", "real estate", "commodities", "diversification"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor has $50,000 saved for a home purchase in 18 months. Where should this money be held?",
          options: [
            "High-yield savings account or short-term T-Bills -- capital preservation over 18 months",
            "S&P 500 index fund -- 18 months is enough time for recovery",
            "50% stocks, 50% bonds -- balanced approach",
            "Small-cap growth funds for maximum appreciation before purchase",
          ],
          correctIndex: 0,
          explanation:
            "With an 18-month, fixed-date spending need, **capital preservation is paramount**. A 30% stock market crash could reduce $50,000 to $35,000, requiring the home purchase to be delayed years or abandoned. HYSA at 4-5% earns $3,500-4,500 in interest over 18 months with zero risk of loss. The S&P 500 is entirely inappropriate for short time horizons with specific, non-deferrable spending goals. Only money you do not need for 5+ years belongs in the stock market.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Two investors each have $10,000 and 25-year horizons. Investor A puts $10,000 in a 70/30 stock/bond portfolio expecting 7.5% annual return. Investor B puts $10,000 in hot individual stocks, day trading based on news, expecting 15% returns.",
          question: "How should we assess these two strategies?",
          options: [
            "Investor A is investing; Investor B is speculating -- research shows active traders underperform indexes by 1.5-3% annually on average",
            "Investor B has a better strategy because higher expected return is always superior",
            "Both are equivalent because they have the same time horizon",
            "Investor B is investing if they have strong research skills",
          ],
          correctIndex: 0,
          explanation:
            "Investor A has an evidence-based investment plan: diversified, low-cost, long-horizon. Investor B is speculating: individual stock picking and active trading have been shown to underperform index funds in 80-90% of cases over long periods (SPIVA data). The 15% expected return assumption is not justified by evidence. S&P 500 average annual day trader studies (Brad Barber/Terry Odean, UC Davis) found active traders earn 3.7% less than buy-and-hold annually. The expectation of 15% vs 7.5% is wishful, not analytical.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 5 — Index Funds vs Active Management
       ================================================================ */
    {
      id: "pf-index-funds",
      title: "Index Funds vs Active Management",
      description: "Costs, evidence, the 3-fund portfolio, and why most active managers underperform",
      icon: "BarChart2",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "What Index Funds Are",
          content:
            "An **index fund** is a portfolio that passively tracks a market index (S&P 500, Total US Market, Total International, Bond Market) by holding all or a representative sample of the index's securities.\n\n**Key properties**:\n- No active decisions: The fund holds what the index holds, in proportion\n- Very low costs: No research team, no portfolio managers. Vanguard VTI: 0.03% expense ratio ($3/year on $10,000)\n- Tax efficient: Low turnover means fewer capital gains distributions\n- Diversification by design: VTI holds ~3,700 US stocks across all sectors\n\n**Examples**:\n- VTI (Vanguard Total Stock Market ETF): 0.03% ER, ~3,700 US stocks\n- VOO/VFIAX (Vanguard S&P 500): 0.03% ER, 500 largest US companies\n- VXUS (Vanguard Total International): 0.07% ER, ~8,500 international stocks\n- BND (Vanguard Total Bond Market): 0.03% ER, ~10,000 US bonds\n- FZROX (Fidelity Zero): 0.00% ER (Fidelity-exclusive)\n\nJohn Bogle (Vanguard founder) popularized index investing in 1976 with the first retail index fund. Initially mocked as 'Bogle's folly,' it is now the dominant investment vehicle with $13+ trillion in assets.",
          highlight: ["index fund", "expense ratio", "passive", "diversification"],
        },
        {
          type: "teach",
          title: "The Evidence Against Active Management",
          content:
            "**SPIVA (S&P Indices vs Active) Report** -- the definitive annual study:\n\n**Over 1 year**: ~60% of active large-cap US funds underperform the S&P 500\n**Over 5 years**: ~75% of active funds underperform\n**Over 15 years**: ~85-90% of active funds underperform\n**Over 20 years**: ~92% of active funds underperform\n\nThe longer the horizon, the worse active management performs. Why?\n\n**1. The Cost Drag**: Average active fund charges 0.75-1.5% annually vs 0.03% for index funds. The manager must beat the market by their expense ratio just to break even with the index. Compounded over 20 years, a 1% cost difference is enormous.\n\n**2. Zero-Sum Game**: Before costs, active managers collectively cannot all beat the market -- they ARE the market. After costs, active management is a negative-sum game.\n\n**3. Survivorship Bias**: Only the funds that survived are counted. Thousands of underperforming funds are closed and merged, making average performance look better than it actually is.\n\n**4. Hot Hand Fallacy**: Past outperformance does not predict future outperformance. Funds that beat the index in one period are no more likely to beat it in the next.",
          highlight: ["SPIVA", "underperform", "cost drag", "survivorship bias"],
        },
        {
          type: "quiz-mc",
          question:
            "An actively managed large-cap fund charges 1.1% annually. The S&P 500 index fund charges 0.03%. If the market returns 10% annually, by what percentage must the active fund's manager outperform the market just for the investor to break even with the index fund?",
          options: [
            "1.07% -- the manager must outperform by the fee differential",
            "0.03% -- the index fund fees are the only cost",
            "10% -- must double the market return",
            "0.55% -- split the difference",
          ],
          correctIndex: 0,
          explanation:
            "Index fund net return: 10% - 0.03% = 9.97%. Active fund net return needed to match: 9.97%. Active fund gross return needed: 9.97% + 1.1% = 11.07%. The manager must outperform the market by 1.07% -- consistently, year after year -- just for the investor to break even. SPIVA data shows this is achieved by fewer than 10-15% of active managers over long periods. The expense ratio is a guaranteed drag; the outperformance is uncertain.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Three-Fund Portfolio",
          content:
            "The **three-fund portfolio** is widely considered the simplest evidence-based investment approach for individual investors:\n\n**Fund 1 -- US Total Stock Market** (VTI, FZROX, SWTSX)\nBroad exposure to the entire US economy: large-cap, mid-cap, small-cap. 60-80% of portfolio for long-horizon investors.\n\n**Fund 2 -- International Total Market** (VXUS, FZILX, SWISX)\nExposure to developed and emerging markets outside the US. Diversifies country and currency risk. 20-40% of portfolio.\n\n**Fund 3 -- Total Bond Market** (BND, FXNAX, SWAGX)\nUS investment-grade bonds. Reduces volatility, provides income. Allocation increases as retirement approaches (age-based rule: bond % = age, or more aggressive: bond % = age - 10).\n\n**Sample allocations**:\n- Age 25: 70% VTI / 20% VXUS / 10% BND\n- Age 45: 55% VTI / 15% VXUS / 30% BND\n- Age 65 (retirement): 40% VTI / 10% VXUS / 50% BND\n\n**Why this works**: You hold virtually the entire investable world market at near-zero cost. You capture all returns the market generates. No single-stock risk. No manager risk. Rebalance annually.",
          visual: "portfolio-pie",
          highlight: ["three-fund portfolio", "VTI", "VXUS", "BND", "rebalance"],
        },
        {
          type: "quiz-tf",
          statement:
            "Owning 500 individual S&P 500 stocks directly provides the same benefits as owning an S&P 500 index fund.",
          correct: false,
          explanation:
            "Owning individual stocks requires enormous transaction costs to purchase and maintain 500 positions, ongoing rebalancing when index composition changes (dozens of additions and deletions per year), no dividend reinvestment automation, and significant tracking complexity. An index fund handles all of this for 0.03% annually and provides instantaneous proportional exposure through a single purchase. Additionally, index funds often own thousands more securities (VTI holds ~3,700 vs 500 in VOO), providing broader diversification.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor has $50,000 to invest at age 35 with a 30-year horizon. They are choosing between: (A) Vanguard three-fund portfolio averaging 0.04% expense ratio, (B) actively managed fund with strong 5-year track record charging 1.2% expense ratio.",
          question: "Which is the better choice and why?",
          options: [
            "Three-fund portfolio: 1.16% fee advantage compounds to ~$150,000+ difference over 30 years; past outperformance does not predict future",
            "Active fund: proven 5-year track record is reliable signal of future outperformance",
            "Active fund: professional managers have better information than an index",
            "They are equivalent; choose based on personal preference",
          ],
          correctIndex: 0,
          explanation:
            "At 8% gross return: Three-fund (7.96% net) on $50K over 30 years = ~$516,000. Active fund (6.8% net) = ~$358,000. Difference: ~$158,000 (31% more wealth from the index fund). Additionally, SPIVA research shows 5-year track record has virtually no predictive power for the next 5-year period -- top-quartile active managers revert to the mean. The 1.16% fee guarantee versus uncertain outperformance makes the index fund the rational choice.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 6 — Tax-Advantaged Accounts Deep Dive
       ================================================================ */
    {
      id: "pf-tax-accounts",
      title: "Tax-Advantaged Accounts",
      description: "401k, IRA, Roth IRA, and HSA: contribution limits, rules, and optimization",
      icon: "Landmark",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Why Tax-Advantaged Accounts Matter",
          content:
            "The US tax code provides powerful incentives for retirement saving. Using these accounts correctly is one of the highest-impact financial decisions an individual can make.\n\n**Tax drag in a taxable account**: At a 25% marginal rate, every $1 of investment gains is reduced by $0.25. Over decades, this drag removes a substantial fraction of your final wealth.\n\n**$10,000 invested at 8% for 30 years**:\n- Taxable brokerage (25% tax on gains annually): ~$64,000\n- Traditional 401(k)/IRA (tax deferred): ~$100,600\n- Roth IRA (tax free forever): ~$100,600 (no tax on withdrawal)\n- HSA (medical expenses, triple-advantaged): ~$100,600 tax-free\n\nThe difference is $36,600 per $10,000 invested -- and this compounds with every additional contribution over a career.\n\n**2025 contribution limits**:\n- 401(k): $23,500 (employee), +$7,500 catch-up if age 50+\n- IRA/Roth IRA: $7,000, +$1,000 catch-up if age 50+\n- HSA: $4,300 individual / $8,550 family\n- 529 (education): no federal limit ($18,000/year gift tax exclusion)",
          highlight: ["tax drag", "tax-deferred", "tax-free", "contribution limits"],
        },
        {
          type: "teach",
          title: "Traditional vs Roth: The Tax Timing Decision",
          content:
            "**Traditional 401(k) / Traditional IRA**:\n- Contributions: Pre-tax (deducted from taxable income now)\n- Growth: Tax-deferred (no annual tax on dividends or gains)\n- Withdrawals: Taxed as ordinary income in retirement\n- RMDs: Required Minimum Distributions starting at age 73\n- Best when: Current tax rate is higher than expected retirement tax rate\n\n**Roth 401(k) / Roth IRA**:\n- Contributions: After-tax (no deduction)\n- Growth: Tax-free\n- Withdrawals: Completely tax-free (contributions any time; earnings after age 59.5)\n- No RMDs on Roth IRA (Roth 401k has RMDs unless rolled to Roth IRA)\n- Best when: Current tax rate is lower than expected retirement rate\n\n**Roth IRA income limits (2025)**: Phase-out begins at $150,000 (single) / $236,000 (married). Above $165,000 (single) / $246,000 (married), direct Roth IRA contributions are not allowed.\n\n**Backdoor Roth IRA**: High earners above income limits can contribute to a non-deductible Traditional IRA then convert to Roth. No income limit on conversions.\n\n**Roth conversion ladder**: Strategic conversions from Traditional to Roth in low-income years (gap between retirement and Social Security, for example).",
          highlight: ["traditional", "Roth", "RMDs", "backdoor Roth", "tax rate"],
        },
        {
          type: "quiz-mc",
          question:
            "A 28-year-old software engineer earns $95,000/year (22% marginal tax bracket) and expects to retire with $200,000+ in annual withdrawals (32%+ bracket). Should they prioritize Traditional or Roth contributions?",
          options: [
            "Roth -- paying 22% now to avoid 32%+ tax on larger withdrawals in retirement",
            "Traditional -- always defer taxes to minimize current income",
            "Neither -- income is too high for Roth contributions",
            "50/50 split for guaranteed tax diversification",
          ],
          correctIndex: 0,
          explanation:
            "The key question: will your retirement tax rate be higher or lower than today? At $95K with expected large retirement withdrawals, the tax rate will almost certainly be higher in retirement (32%+ bracket). Pay 22 cents per dollar today in Roth contributions rather than 32+ cents per dollar in Traditional withdrawals. Note: $95K is below the Roth IRA income phase-out of $150K (single), so direct Roth IRA contributions are permitted. The Roth advantage grows as the rate differential widens.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "HSA: The Triple Tax Advantage Account",
          content:
            "The **Health Savings Account (HSA)** is arguably the most powerful tax-advantaged account available in the US:\n\n**Three tax advantages**:\n1. Contributions are **tax-deductible** (reduce current taxable income)\n2. Growth is **tax-free** (dividends and capital gains not taxed)\n3. Withdrawals are **tax-free** for qualified medical expenses\n\nNo other account has all three. A Roth IRA lacks benefit #1. A Traditional 401(k) lacks benefit #3.\n\n**Eligibility**: Must be enrolled in a **High-Deductible Health Plan (HDHP)**. 2025: minimum deductible $1,650 (individual) / $3,300 (family).\n\n**2025 contribution limits**: $4,300 individual / $8,550 family.\n\n**Investment strategy**: Pay current medical expenses out-of-pocket, invest all HSA contributions in index funds. Let it grow tax-free for decades.\n\n**After age 65**: Non-medical withdrawals are taxed as ordinary income -- essentially becomes a Traditional IRA with no required minimum distributions.\n\n**The stealth IRA strategy**: Max HSA, invest in index funds, keep receipts for all medical expenses paid out-of-pocket. At retirement, claim reimbursement for decades of medical expenses -- all tax-free. No statute of limitations on reimbursement.",
          highlight: ["HSA", "triple tax advantage", "HDHP", "stealth IRA"],
        },
        {
          type: "quiz-tf",
          statement:
            "You must spend HSA funds in the same year they are contributed or forfeit them (use-it-or-lose-it rule).",
          correct: false,
          explanation:
            "This is a common misconception about **FSAs (Flexible Spending Accounts)**, NOT HSAs. FSA funds generally expire if not used within the plan year. HSA funds **roll over indefinitely** with no expiration. This is exactly what makes HSA the superior account: accumulate for decades, invest in index funds, and withdraw tax-free for medical expenses in retirement when healthcare costs are highest. An FSA is an employer-owned account with use-it-or-lose-it rules; an HSA is individually owned and portable across jobs.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Jordan earns $85,000/year, has a 22% marginal rate, and faces these choices: (1) Max employer 401k match at 3%, (2) Fund Roth IRA $7,000, (3) Contribute to HSA $4,300. Jordan can only afford two of the three due to budget constraints.",
          question: "What is the optimal priority order?",
          options: [
            "Max employer 401k match first (instant 50-100% return), then HSA (triple tax advantage), then Roth IRA",
            "Roth IRA first (largest contribution room), then 401k match, then HSA",
            "HSA first (medical emergencies take priority), then Roth IRA, then 401k match",
            "401k match first, then Roth IRA, then HSA (medical can wait)",
          ],
          correctIndex: 0,
          explanation:
            "Priority 1: Always capture the full employer match -- it is an instant 50-100% return, better than any other investment. Priority 2: HSA ($4,300) before additional Roth IRA because the triple tax advantage (deductible + growth + withdrawal) provides more value per dollar than Roth (growth + withdrawal only). The Roth IRA is excellent but ranks third because HSA's full triple advantage exceeds Roth's double advantage, especially for someone who will have significant medical expenses in retirement.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 7 — Debt Management Deep Dive
       ================================================================ */
    {
      id: "pf-debt-management",
      title: "Debt Management",
      description: "Avalanche vs snowball, good debt vs bad debt, and systematic payoff strategies",
      icon: "CreditCard",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Good Debt vs Bad Debt",
          content:
            "Not all debt is equal. The traditional distinction:\n\n**Good Debt** (generally): Debt used to acquire an asset that appreciates, generates income, or increases your earning capacity, at an interest rate below expected investment returns.\n- Mortgage: Property historically appreciates; mortgage rates ~6-7% vs long-term stock returns ~10%\n- Student loans at low rates for high-ROI degrees: $50K in debt for an engineering degree that adds $30K/year income is often worth it\n- Business loans: Debt that directly generates income exceeding the interest cost\n\n**Bad Debt** (generally): Debt for depreciating assets or consumption, at high interest rates.\n- Credit cards at 20-25% APR: No asset acquired; compounding works against you\n- Car loans for luxury vehicles above your means: Car depreciates 20% in year one\n- Personal loans for vacations: Consumption debt at 10-15% APR\n- Buy-Now-Pay-Later on discretionary purchases: Often 0% introductory then 29%+\n\n**The key question**: Does the expected return on what you purchased exceed the interest cost? A $30,000 car loan at 6% for reliable commuter transportation enabling a $70K job is reasonable. The same loan for a luxury SUV primarily for status is not.\n\n**Rule of thumb**: Any interest rate above ~6-8% (roughly your expected investment return) deserves urgent payoff before investing beyond match capture.",
          highlight: ["good debt", "bad debt", "interest rate", "ROI"],
        },
        {
          type: "teach",
          title: "Debt Payoff Methods: Avalanche vs Snowball",
          content:
            "Two proven frameworks for debt elimination. Both require:\n1. Pay the **minimum on all debts** every month\n2. Direct all **extra available money** to one target debt\n3. When target debt is eliminated, roll that payment to the next\n\n**Debt Avalanche (mathematically optimal)**:\nTarget the **highest interest rate** debt first, regardless of balance.\n- Minimizes total interest paid over the payoff period\n- Often saves hundreds to thousands of dollars vs snowball\n- Best for: Disciplined, analytically motivated individuals\n\n**Debt Snowball (psychologically powerful)**:\nTarget the **smallest balance** debt first, regardless of interest rate.\n- Generates quick wins (first account eliminated sooner)\n- Behavioral research (Harvard Business School) shows snowball users are more likely to complete their debt payoff entirely\n- Best for: Those who need motivation and early victories to stay on track\n\n**Hybrid approach**: Start snowball to build momentum, switch to avalanche once motivated.\n\nThe difference in total interest between avalanche and snowball is typically 5-15%. Both are vastly superior to paying minimums only, which can take 20+ years and cost 2-3x the original balance in interest.",
          highlight: ["debt avalanche", "debt snowball", "interest rate", "balance"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your debts:\n- Credit card: $2,800 balance, 24% APR, $56 minimum\n- Medical bill: $950 balance, 0% APR, $50 minimum\n- Car loan: $11,500 balance, 5.9% APR, $280 minimum\n- Student loan: $28,000 balance, 5.5% APR, $310 minimum\n\nYou have $800/month to allocate. Total minimums = $696/month. Extra: $104/month.",
          question: "Using the Debt Avalanche, which debt receives the extra $104/month first?",
          options: [
            "Credit card at 24% APR -- highest interest rate regardless of balance",
            "Medical bill at $950 -- smallest balance gets paid off fastest",
            "Student loan at $28,000 -- largest balance creates most urgency",
            "Car loan at 5.9% -- most manageable medium-term debt",
          ],
          correctIndex: 0,
          explanation:
            "Avalanche targets 24% APR credit card first. At $160/month ($56 minimum + $104 extra), the $2,800 credit card is eliminated in ~18 months, saving approximately $700-900 in interest vs paying minimums only. The 0% medical bill costs nothing in interest, so it is deprioritized despite being the smallest balance -- avalanche always targets rate, not balance.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Interest Rate Arbitrage: When to Invest Instead of Paying Debt",
          content:
            "Not all debt should be paid off before investing. The math:\n\n**Pay debt first when**: Debt interest rate > Expected investment return\n- Credit card at 22%: Pay off immediately. No investment reliably beats 22% risk-free.\n- Personal loan at 14%: Pay off. Market may return 10% but with risk; 14% payoff is guaranteed.\n\n**Invest instead when**: Debt interest rate < Expected investment return\n- Mortgage at 6.5% (deductible, effective ~5.5%): Stock market historically returns ~10%. Marginal extra payments go to investing.\n- Student loans at 4%: Invest; expected stock returns exceed 4% substantially.\n\n**The fuzzy zone (6-8%)**: Personal preference and risk tolerance determine the choice. Paying down debt is a guaranteed return; investing is expected but uncertain.\n\n**Exception**: Always capture the employer 401(k) match before paying any debt beyond minimums. The match is an instant 50-100% guaranteed return.",
          highlight: ["interest rate arbitrage", "guaranteed return", "employer match", "fuzzy zone"],
        },
        {
          type: "quiz-tf",
          statement:
            "You should pay off your 3.5% student loan as aggressively as possible before investing in the stock market.",
          correct: false,
          explanation:
            "A 3.5% student loan interest rate is almost certainly below your long-term expected investment return (S&P 500 historical nominal average: ~10%). Additionally, student loan interest may be partially tax-deductible. The rational approach: capture all employer 401(k) match (instant guaranteed return), fund emergency fund, then invest in tax-advantaged accounts rather than extra student loan payments. Paying off a 3.5% loan early while forgoing 10%+ compound growth is a poor risk-adjusted trade. The priority changes above 6-8% interest rates.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following is the correct order for debt vs investment decisions?",
          options: [
            "Minimum payments on all debts -> Capture employer 401k match -> Pay off high-interest debt (>8%) -> Build emergency fund -> Invest remainder",
            "Pay off all debt before investing anything",
            "Invest everything and pay only minimums on debt",
            "Emergency fund first, then pay off all debt, then invest",
          ],
          correctIndex: 0,
          explanation:
            "The optimal sequence: (1) Minimums on all debts to avoid defaults and penalties, (2) Capture the employer match (guaranteed 50-100% return beats any debt payoff), (3) Eliminate high-interest debt (above ~8% where expected investment returns cannot reliably beat the guaranteed debt payoff), (4) Build a 3-6 month emergency fund, (5) Invest in tax-advantaged accounts. Low-interest debt (below ~5-6%) can be carried while investing, as the expected investment return exceeds the debt cost.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 8 — Insurance Fundamentals
       ================================================================ */
    {
      id: "pf-insurance",
      title: "Insurance Fundamentals",
      description: "Term vs whole life, disability, health, and umbrella insurance explained",
      icon: "ShieldCheck",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "Insurance Principles: Transferring Catastrophic Risk",
          content:
            "Insurance is a **risk transfer mechanism**: you pay a known small cost (premium) to eliminate the possibility of an unknown large loss. The economic logic of insurance relies on two conditions:\n\n**When insurance makes sense**:\n1. The potential loss is **catastrophic** (would severely damage your financial position)\n2. The probability of loss is low enough to make premiums reasonable\n\nYou self-insure risks that are either small enough to absorb from your emergency fund or so probable that premiums would approach the expected loss.\n\n**Insurance you almost certainly need**:\n- Health insurance (medical catastrophe risk)\n- Disability income insurance (income replacement)\n- Term life insurance (if others depend on your income)\n- Auto liability (legal requirement; also catastrophic risk)\n- Homeowner's/renter's insurance (property and liability)\n\n**Insurance to evaluate critically** (often not worth it for most people):\n- Whole life insurance (except specific estate planning situations)\n- Extended warranties on electronics\n- Cell phone insurance\n- Pet insurance (depends on pet health and financial situation)",
          highlight: ["risk transfer", "catastrophic risk", "premium", "self-insure"],
        },
        {
          type: "teach",
          title: "Term Life vs Whole Life Insurance",
          content:
            "**Term Life Insurance**:\n- Pure death benefit for a specified term (10, 20, 30 years)\n- If you die during the term, beneficiaries receive the death benefit\n- No cash value accumulation\n- Very low cost: A healthy 30-year-old can buy $500K of 20-year term for $25-35/month\n- Best for: Replacing income that dependents rely on during working years\n\n**Whole Life Insurance** (and other permanent life: Universal, Variable):\n- Death benefit plus savings/investment component (cash value)\n- Premiums are 5-15x higher than equivalent term coverage\n- Cash value grows slowly, access is complex\n- Insurance companies market this as investment plus protection\n\n**Why most financial planners recommend term plus invest the difference**:\nThe cost difference between whole life and term (often $200-400/month) invested in a low-cost index fund will, in most scenarios, generate far more wealth than the whole life cash value component.\n\n**Who genuinely benefits from whole life**: High-net-worth individuals with irrevocable life insurance trusts (ILITs) for estate planning, certain business succession planning scenarios. This is a small minority.\n\n**Simple rule**: If you need life insurance, buy term. The purpose of insurance is protection, not investment.",
          highlight: ["term life", "whole life", "death benefit", "cash value", "buy term invest the difference"],
        },
        {
          type: "quiz-tf",
          statement:
            "Whole life insurance is always a superior product to term life because it builds cash value and provides a death benefit, giving you two benefits for one product.",
          correct: false,
          explanation:
            "The 'two benefits' framing is a sales technique. Whole life combines insurance (which you may need) with a savings component (which has poor returns due to high internal costs and commissions). The standard financial planning analysis: compare term cost vs whole life cost, invest the difference in an index fund. In almost all scenarios for the average person, term plus index fund outperforms whole life's cash value by a wide margin over 20-30 years. The complexity and high commissions in whole life products serve the agent and insurer more than the policyholder in most cases.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Disability Insurance: Protecting Your Income",
          content:
            "**Disability insurance** replaces a portion of your income if you become unable to work due to illness or injury. Most financial advisors consider this more important than life insurance for young workers.\n\n**Why it matters**: The Social Security Administration estimates a 25-year-old has a 1 in 4 chance of becoming disabled before retirement. Your ability to earn income is your most valuable financial asset. A 30-year-old earning $80,000/year has $2.4 million in remaining lifetime earnings.\n\n**Key policy terms**:\n- **Benefit amount**: Typically 60-70% of pre-disability income\n- **Elimination period**: Waiting period before benefits begin (30/60/90/180 days -- longer = lower premium)\n- **Benefit period**: How long benefits are paid (2 years, 5 years, to age 65/67)\n- **Own-occupation definition**: Disabled from YOUR specific occupation (stronger protection)\n- **Any-occupation definition**: Only disabled if unable to work ANY job (weaker -- avoid)\n\n**Sources**:\n- Employer group disability (short-term usually 60-90 days; long-term after)\n- Individual disability policy (more expensive but portable, stronger definitions)\n- Social Security Disability Insurance (SSDI) -- very hard to qualify, long delays\n\n**Minimum target**: Employer long-term disability plus individual policy covering 60-70% of income, own-occupation definition, benefit to age 65.",
          highlight: ["disability insurance", "own-occupation", "elimination period", "benefit period"],
        },
        {
          type: "quiz-mc",
          question:
            "Two disability policies cover the same income amount. Policy A uses 'own-occupation' definition; Policy B uses 'any-occupation' definition. A surgeon's hand is injured preventing surgery but allowing desk work. What happens under each policy?",
          options: [
            "Policy A pays benefits (surgeon disabled from own occupation); Policy B pays nothing (can work any job)",
            "Both pay benefits -- injury is injury regardless of definition",
            "Neither pays -- partial disability does not qualify",
            "Policy B pays more because 'any occupation' provides broader coverage",
          ],
          correctIndex: 0,
          explanation:
            "Under **own-occupation**: the surgeon is disabled from practicing surgery (their defined occupation) -- benefits are paid even if they could work as a medical consultant. Under **any-occupation**: because the surgeon can perform desk work or other jobs, they are NOT considered disabled under the policy definition -- no benefits paid. For high-income professionals with specialized skills, own-occupation is essential and worth the higher premium. Any-occupation provides far weaker protection.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Alex (age 32) has: $280,000 in retirement accounts, $45,000 in taxable brokerage, earns $90,000/year, has a 15-year-old driver in the household, and a swimming pool. Current insurance: state minimum auto ($50,000 liability), homeowner's with $100,000 liability.",
          question: "What is Alex's most critical insurance gap?",
          options: [
            "No umbrella insurance: exposed to multi-million dollar judgments with only $150,000 in total liability coverage and high-risk household factors",
            "No whole life insurance: needs permanent coverage for dependents",
            "Extended warranty gap: electronics not covered",
            "Current insurance is sufficient for Alex's asset level",
          ],
          correctIndex: 0,
          explanation:
            "Alex has $325K in investable assets plus $90K/year income that can be garnished. Total current liability coverage is only $150K ($50K auto + $100K home). A teenager driver plus a swimming pool are two of the highest liability risk factors -- a single accident could generate a $1-3M judgment. Umbrella insurance ($1M coverage for ~$200/year) would cost Alex 0.06% of his portfolio annually. Without it, a single incident could wipe out his entire financial position. This is the textbook case for umbrella insurance.",
          difficulty: 2,
        },
      ],
    },
  ],
};

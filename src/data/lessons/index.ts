import type { Unit, Lesson } from "./types";
import { UNIT_BASICS } from "./unit-basics";
import { UNIT_ORDERS } from "./unit-orders";
import { UNIT_INDICATORS } from "./unit-indicators";
import { UNIT_RISK } from "./unit-risk";
import { UNIT_FUNDAMENTALS } from "./unit-fundamentals";
import { UNIT_PERSONAL_FINANCE } from "./unit-personal-finance";
import { UNIT_PERSONAL_FINANCE_FUNDAMENTALS } from "./unit-personal-finance-fundamentals";
import { UNIT_OPTIONS_STRATEGIES_PRACTICE } from "./unit-options-strategies-practice";
import { UNIT_MACRO_TRADING } from "./unit-macro-trading";
import { UNIT_CRYPTO_TRADING } from "./unit-crypto-trading";
import { UNIT_ADVANCED_TECHNICAL_ANALYSIS } from "./unit-advanced-technical-analysis";
import { UNIT_PORTFOLIO_CONSTRUCTION } from "./unit-portfolio-construction";
import { UNIT_PERSONAL_FINANCE_MASTERY } from "./unit-personal-finance-mastery";
import { UNIT_BEHAVIORAL_FINANCE } from "./unit-behavioral-finance";
import { UNIT_OPTIONS_PRICING_THEORY } from "./unit-options-pricing-theory";
import { UNIT_QUANTITATIVE_FINANCE } from "./unit-quantitative-finance";
import { UNIT_INVESTMENT_BANKING } from "./unit-investment-banking";
import { UNIT_RISK_MANAGEMENT_MASTERY } from "./unit-risk-management-mastery";
import { UNIT_TRADING_PSYCHOLOGY } from "./unit-trading-psychology";
import { UNIT_TECHNICAL_ANALYSIS_MASTERY } from "./unit-technical-analysis-mastery";
import { UNIT_ADVANCED_OPTIONS } from "./unit-advanced-options";
import { UNIT_INTERNATIONAL_MARKETS } from "./unit-international-markets";
import { UNIT_ESG_INVESTING } from "./unit-esg-investing";
import { UNIT_CRYPTO_DEFI } from "./unit-crypto-defi";
import { UNIT_FIXED_INCOME } from "./unit-fixed-income";
import { UNIT_DERIVATIVES_ADVANCED } from "./unit-derivatives-advanced";
import { UNIT_MACRO_INVESTING } from "./unit-macro-investing";
import { UNIT_PRIVATE_EQUITY } from "./unit-private-equity";
import { UNIT_HEDGE_FUNDS } from "./unit-hedge-funds";
import { UNIT_MARKET_MICROSTRUCTURE } from "./unit-market-microstructure";
import { UNIT_MARKET_HISTORY } from "./unit-market-history";
import { UNIT_INFLATION_ECONOMICS } from "./unit-inflation-economics";
import { UNIT_INSURANCE_PLANNING } from "./unit-insurance-planning";
import { UNIT_COMMODITIES_TRADING } from "./unit-commodities-trading";
import { UNIT_VENTURE_CAPITAL } from "./unit-venture-capital";
import { UNIT_CORPORATE_FINANCE } from "./unit-corporate-finance";
import { UNIT_DEFI_WEB3 } from "./unit-defi-web3";
import { UNIT_MACROECONOMICS } from "./unit-macroeconomics";
import { UNIT_REAL_ESTATE_INVESTING } from "./unit-real-estate-investing";
import { UNIT_PORTFOLIO_THEORY } from "./unit-portfolio-theory";
import { UNIT_STRUCTURED_PRODUCTS } from "./unit-structured-products";
import { UNIT_CREDIT_ANALYSIS } from "./unit-credit-analysis";
import { UNIT_MARKET_INTELLIGENCE } from "./unit-market-intelligence";
import { UNIT_QUANT_STRATEGIES } from "./unit-quant-strategies";
import { UNIT_FINANCIAL_HISTORY } from "./unit-financial-history";
import { UNIT_WEALTH_MANAGEMENT } from "./unit-wealth-management";
import { UNIT_ESG_ADVANCED } from "./unit-esg-advanced";
import { UNIT_TRADING_SYSTEMS } from "./unit-trading-systems";
import { UNIT_FIXED_INCOME_ADVANCED } from "./unit-fixed-income-advanced";
import { UNIT_CRYPTO_PROTOCOLS } from "./unit-crypto-protocols";
import { UNIT_DERIVATIVES_PRICING } from "./unit-derivatives-pricing";
import { UNIT_PERSONAL_FINANCE_ADVANCED } from "./unit-personal-finance-advanced";
import { UNIT_STARTUP_EQUITY } from "./unit-startup-equity";
import { UNIT_CORPORATE_GOVERNANCE } from "./unit-corporate-governance";
import { UNIT_QUANT_FINANCE_ML } from "./unit-quant-finance-ml";
import { UNIT_FINANCIAL_REGULATIONS } from "./unit-financial-regulations";
import { UNIT_GLOBAL_MACRO_STRATEGIES } from "./unit-global-macro-strategies";
import { UNIT_ECONOMIC_CYCLES } from "./unit-economic-cycles";
import { UNIT_SUPPLY_CHAIN_FINANCE } from "./unit-supply-chain-finance";
import { UNIT_MERGERS_ACQUISITIONS } from "./unit-mergers-acquisitions";
import { UNIT_GLOBAL_ECONOMICS } from "./unit-global-economics";
import { UNIT_SOVEREIGN_DEBT } from "./unit-sovereign-debt";
import { UNIT_ALTERNATIVE_ASSETS } from "./unit-alternative-assets";
import { UNIT_BANKING_SYSTEM } from "./unit-banking-system";
import { UNIT_RETIREMENT_PLANNING } from "./unit-retirement-planning";
import { UNIT_TAX_PLANNING } from "./unit-tax-planning";
import { UNIT_EMERGING_MARKETS } from "./unit-emerging-markets";
import { UNIT_RISK_ANALYTICS } from "./unit-risk-analytics";
import { UNIT_CONSUMER_RETAIL } from "./unit-consumer-retail";
import { UNIT_PORTFOLIO_STRESS } from "./unit-portfolio-stress";
import { UNIT_FIXED_INCOME_CREDIT } from "./unit-fixed-income-credit";
import { UNIT_MARKET_PSYCHOLOGY } from "./unit-market-psychology";
import { UNIT_OPTIONS_GREEKS } from "./unit-options-greeks";
import { UNIT_TA_PATTERNS } from "./unit-ta-patterns";
import { UNIT_PERSONAL_BUDGETING } from "./unit-personal-budgeting";
import { UNIT_INTEREST_RATE_RISK } from "./unit-interest-rate-risk";
import { UNIT_LBO_MODELING } from "./unit-lbo-modeling";
import { UNIT_DIVIDEND_INVESTING } from "./unit-dividend-investing";
import { UNIT_GEOPOLITICAL_RISK } from "./unit-geopolitical-risk";
import { UNIT_CREDIT_RISK } from "./unit-credit-risk";
import { UNIT_ACCOUNTING_EARNINGS } from "./unit-accounting-earnings";
import { UNIT_INFLATION_INVESTING } from "./unit-inflation-investing";
import { UNIT_INSURANCE_RISK } from "./unit-insurance-risk";
import { UNIT_MOMENTUM_TREND } from "./unit-momentum-trend";
import { UNIT_CRYPTO_YIELD } from "./unit-crypto-yield";
import { UNIT_FIRE_MOVEMENT } from "./unit-fire-movement";
import { UNIT_VALUE_INVESTING } from "./unit-value-investing";
import { UNIT_GLOBAL_TRADE } from "./unit-global-trade";
import { UNIT_MONETARY_POLICY } from "./unit-monetary-policy";
import { UNIT_SYSTEMATIC_TRADING } from "./unit-systematic-trading";
import { UNIT_WEALTH_INEQUALITY } from "./unit-wealth-inequality";
import { UNIT_REAL_ESTATE_ANALYSIS } from "./unit-real-estate-analysis";
import { UNIT_CRYPTO_REGULATION } from "./unit-crypto-regulation";
import { UNIT_IMPACT_INVESTING } from "./unit-impact-investing";
import { UNIT_FINANCIAL_STATEMENTS } from "./unit-financial-statements";
import { UNIT_BEHAVIORAL_ECONOMICS } from "./unit-behavioral-economics";
import { UNIT_INVESTMENT_MATH } from "./unit-investment-math";
import { UNIT_SECURITIES_LAW } from "./unit-securities-law";
import { UNIT_ECONOMIC_HISTORY } from "./unit-economic-history";
import { UNIT_TAX_ADVANTAGED } from "./unit-tax-advantaged";
import { UNIT_HEDGE_FUND_DD } from "./unit-hedge-fund-dd";
import { UNIT_FINTECH_LENDING } from "./unit-fintech-lending";
import { UNIT_WEB3_INFRASTRUCTURE } from "./unit-web3-infrastructure";
import { UNIT_INTERNATIONAL_INVESTING } from "./unit-international-investing";
import { UNIT_MARKET_BUBBLES } from "./unit-market-bubbles";
import { UNIT_CRYPTO_CYCLES } from "./unit-crypto-cycles";
import { UNIT_MONETARY_SYSTEM } from "./unit-monetary-system";
import { UNIT_COMMODITY_TRADING } from "./unit-commodity-trading";
import { UNIT_CAPITAL_MARKETS_HISTORY } from "./unit-capital-markets-history";
import { UNIT_FINANCIAL_DERIVATIVES } from "./unit-financial-derivatives";
import { UNIT_SUPPLY_DEMAND } from "./unit-supply-demand";
import { UNIT_CRYPTO_FUNDAMENTALS } from "./unit-crypto-fundamentals";
import { UNIT_TRADE_FINANCE } from "./unit-trade-finance";
import { UNIT_DCF_VALUATION } from "./unit-dcf-valuation";
import { UNIT_POSITION_SIZING } from "./unit-position-sizing";
import { UNIT_SECTOR_ANALYSIS } from "./unit-sector-analysis";
import { UNIT_COMPETITIVE_MOATS } from "./unit-competitive-moats";
import { UNIT_BOND_MATH } from "./unit-bond-math";
import { UNIT_FINANCIAL_RATIOS } from "./unit-financial-ratios";
import { UNIT_OPTIONS_BASICS } from "./unit-options-basics";

export const UNITS: Unit[] = [
  UNIT_BASICS,
  UNIT_ORDERS,
  UNIT_INDICATORS,
  UNIT_RISK,
  UNIT_FUNDAMENTALS,
  UNIT_PERSONAL_FINANCE,
  UNIT_PERSONAL_FINANCE_FUNDAMENTALS,
  UNIT_OPTIONS_STRATEGIES_PRACTICE,
  UNIT_MACRO_TRADING,
  UNIT_CRYPTO_TRADING,
  UNIT_ADVANCED_TECHNICAL_ANALYSIS,
  UNIT_PORTFOLIO_CONSTRUCTION,
  UNIT_PERSONAL_FINANCE_MASTERY,
  UNIT_BEHAVIORAL_FINANCE,
  UNIT_OPTIONS_PRICING_THEORY,
  UNIT_QUANTITATIVE_FINANCE,
  UNIT_INVESTMENT_BANKING,
  UNIT_RISK_MANAGEMENT_MASTERY,
  UNIT_TRADING_PSYCHOLOGY,
  UNIT_TECHNICAL_ANALYSIS_MASTERY,
  UNIT_ADVANCED_OPTIONS,
  UNIT_INTERNATIONAL_MARKETS,
  UNIT_ESG_INVESTING,
  UNIT_CRYPTO_DEFI,
  UNIT_FIXED_INCOME,
  UNIT_DERIVATIVES_ADVANCED,
  UNIT_MACRO_INVESTING,
  UNIT_PRIVATE_EQUITY,
  UNIT_HEDGE_FUNDS,
  UNIT_MARKET_MICROSTRUCTURE,
  UNIT_MARKET_HISTORY,
  UNIT_INFLATION_ECONOMICS,
  UNIT_INSURANCE_PLANNING,
  UNIT_COMMODITIES_TRADING,
  UNIT_VENTURE_CAPITAL,
  UNIT_CORPORATE_FINANCE,
  UNIT_DEFI_WEB3,
  UNIT_MACROECONOMICS,
  UNIT_REAL_ESTATE_INVESTING,
  UNIT_PORTFOLIO_THEORY,
  UNIT_STRUCTURED_PRODUCTS,
  UNIT_CREDIT_ANALYSIS,
  UNIT_MARKET_INTELLIGENCE,
  UNIT_QUANT_STRATEGIES,
  UNIT_FINANCIAL_HISTORY,
  UNIT_WEALTH_MANAGEMENT,
  UNIT_ESG_ADVANCED,
  UNIT_TRADING_SYSTEMS,
  UNIT_FIXED_INCOME_ADVANCED,
  UNIT_CRYPTO_PROTOCOLS,
  UNIT_DERIVATIVES_PRICING,
  UNIT_PERSONAL_FINANCE_ADVANCED,
  UNIT_STARTUP_EQUITY,
  UNIT_CORPORATE_GOVERNANCE,
  UNIT_QUANT_FINANCE_ML,
  UNIT_FINANCIAL_REGULATIONS,
  UNIT_GLOBAL_MACRO_STRATEGIES,
  UNIT_ECONOMIC_CYCLES,
  UNIT_SUPPLY_CHAIN_FINANCE,
  UNIT_MERGERS_ACQUISITIONS,
  UNIT_GLOBAL_ECONOMICS,
  UNIT_SOVEREIGN_DEBT,
  UNIT_ALTERNATIVE_ASSETS,
  UNIT_BANKING_SYSTEM,
  UNIT_RETIREMENT_PLANNING,
  UNIT_TAX_PLANNING,
  UNIT_EMERGING_MARKETS,
  UNIT_RISK_ANALYTICS,
  UNIT_CONSUMER_RETAIL,
  UNIT_PORTFOLIO_STRESS,
  UNIT_FIXED_INCOME_CREDIT,
  UNIT_MARKET_PSYCHOLOGY,
  UNIT_OPTIONS_GREEKS,
  UNIT_TA_PATTERNS,
  UNIT_PERSONAL_BUDGETING,
  UNIT_INTEREST_RATE_RISK,
  UNIT_LBO_MODELING,
  UNIT_DIVIDEND_INVESTING,
  UNIT_GEOPOLITICAL_RISK,
  UNIT_CREDIT_RISK,
  UNIT_ACCOUNTING_EARNINGS,
  UNIT_INFLATION_INVESTING,
  UNIT_INSURANCE_RISK,
  UNIT_MOMENTUM_TREND,
  UNIT_CRYPTO_YIELD,
  UNIT_FIRE_MOVEMENT,
  UNIT_VALUE_INVESTING,
  UNIT_GLOBAL_TRADE,
  UNIT_MONETARY_POLICY,
  UNIT_SYSTEMATIC_TRADING,
  UNIT_WEALTH_INEQUALITY,
  UNIT_REAL_ESTATE_ANALYSIS,
  UNIT_CRYPTO_REGULATION,
  UNIT_IMPACT_INVESTING,
  UNIT_FINANCIAL_STATEMENTS,
  UNIT_BEHAVIORAL_ECONOMICS,
  UNIT_INVESTMENT_MATH,
  UNIT_SECURITIES_LAW,
  UNIT_ECONOMIC_HISTORY,
  UNIT_TAX_ADVANTAGED,
  UNIT_HEDGE_FUND_DD,
  UNIT_FINTECH_LENDING,
  UNIT_WEB3_INFRASTRUCTURE,
  UNIT_INTERNATIONAL_INVESTING,
  UNIT_MARKET_BUBBLES,
  UNIT_CRYPTO_CYCLES,
  UNIT_MONETARY_SYSTEM,
  UNIT_COMMODITY_TRADING,
  UNIT_CAPITAL_MARKETS_HISTORY,
  UNIT_FINANCIAL_DERIVATIVES,
  UNIT_SUPPLY_DEMAND,
  UNIT_CRYPTO_FUNDAMENTALS,
  UNIT_TRADE_FINANCE,
  UNIT_DCF_VALUATION,
  UNIT_POSITION_SIZING,
  UNIT_SECTOR_ANALYSIS,
  UNIT_COMPETITIVE_MOATS,
  UNIT_BOND_MATH,
  UNIT_FINANCIAL_RATIOS,
  UNIT_OPTIONS_BASICS,
];

export function getLessonById(lessonId: string): Lesson | undefined {
  for (const unit of UNITS) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getUnitForLesson(lessonId: string): Unit | undefined {
  return UNITS.find((u) => u.lessons.some((l) => l.id === lessonId));
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: string[],
): boolean {
  for (const unit of UNITS) {
    const unitIndex = UNITS.indexOf(unit);
    const lessonIndex = unit.lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex === -1) continue;

    // First lesson of first unit is always unlocked
    if (unitIndex === 0 && lessonIndex === 0) return true;

    // First lesson of a unit: requires all lessons of previous unit completed
    if (lessonIndex === 0 && unitIndex > 0) {
      const prevUnit = UNITS[unitIndex - 1];
      return prevUnit.lessons.every((l) => completedLessons.includes(l.id));
    }

    // Other lessons: require previous lesson in same unit completed
    const prevLesson = unit.lessons[lessonIndex - 1];
    return completedLessons.includes(prevLesson.id);
  }

  return false;
}

export type { Unit, Lesson, LessonStep, StepType, VisualType } from "./types";
export type {
  TeachStep,
  QuizMCStep,
  QuizTFStep,
  QuizScenarioStep,
  PracticeStep,
} from "./types";

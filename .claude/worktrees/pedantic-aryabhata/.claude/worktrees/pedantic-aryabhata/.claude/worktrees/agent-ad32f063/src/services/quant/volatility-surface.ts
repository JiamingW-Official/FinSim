// IV surface generation with realistic vol smile and term structure

export interface VolSurfacePoint {
  strike: number;
  expiry: number;
  iv: number;
}

export interface VolSurfaceData {
  points: VolSurfacePoint[];
  atmVol: number;
  skew25d: number;
  termStructure: { expiry: number; atmIV: number }[];
}

export function generateVolSurface(
  spotPrice: number,
  baseIV: number
): VolSurfaceData {
  const points: VolSurfacePoint[] = [];

  // Expiries in days
  const expiries = [7, 14, 30, 60, 90, 120, 180, 365];

  // Strike range: 70% to 130% of spot in 2.5% increments
  const strikes: number[] = [];
  for (let pct = 0.7; pct <= 1.301; pct += 0.025) {
    strikes.push(Math.round(spotPrice * pct * 100) / 100);
  }

  const termStructure: { expiry: number; atmIV: number }[] = [];

  // Skew parameters
  // Put skew: OTM puts have higher IV (negative skew in equities)
  // Short-dated options have steeper skew and higher ATM vol during uncertainty
  const skewSlope = -0.12; // IV increases ~12% per 1.0 moneyness unit toward puts
  const smileConvexity = 0.04; // Slight upward curvature for deep OTM calls

  // Track 25-delta skew (approximate)
  let iv25dPut = 0;
  let iv25dCall = 0;

  for (const expiry of expiries) {
    // Term structure: shorter expiries can have higher vol (backwardation)
    // or lower vol (contango). We model slight backwardation for very short,
    // contango for medium, flattening for long.
    const termFactor = getTermFactor(expiry);
    const atmIV = baseIV * termFactor;

    termStructure.push({
      expiry,
      atmIV: Math.round(atmIV * 10000) / 10000,
    });

    for (const strike of strikes) {
      const moneyness = Math.log(strike / spotPrice);
      const timeScale = Math.sqrt(30 / expiry); // Steeper skew for shorter expiries

      // Vol smile model:
      // IV = ATM_IV + skew * moneyness * timeScale + convexity * moneyness^2
      const skewComponent = skewSlope * moneyness * timeScale;
      const smileComponent = smileConvexity * moneyness * moneyness * timeScale;
      const iv = Math.max(0.05, atmIV + skewComponent + smileComponent);

      points.push({
        strike,
        expiry,
        iv: Math.round(iv * 10000) / 10000,
      });

      // Capture ~25 delta points for 30-day expiry (approximate)
      if (expiry === 30) {
        const pctFromATM = (strike - spotPrice) / spotPrice;
        if (Math.abs(pctFromATM - (-0.1)) < 0.015) {
          iv25dPut = iv;
        }
        if (Math.abs(pctFromATM - 0.1) < 0.015) {
          iv25dCall = iv;
        }
      }
    }
  }

  const skew25d =
    iv25dPut && iv25dCall
      ? Math.round((iv25dPut - iv25dCall) * 10000) / 10000
      : Math.round(baseIV * 0.04 * 10000) / 10000;

  return {
    points,
    atmVol: Math.round(baseIV * 10000) / 10000,
    skew25d,
    termStructure,
  };
}

/**
 * Term structure factor: models the shape of the IV term structure.
 * Very short-term: slightly elevated (event risk, gamma).
 * Medium-term: near base.
 * Long-term: converges toward long-run vol (slightly above base).
 */
function getTermFactor(expiryDays: number): number {
  if (expiryDays <= 7) return 1.15; // Short-dated premium
  if (expiryDays <= 14) return 1.08;
  if (expiryDays <= 30) return 1.0; // Base reference
  if (expiryDays <= 60) return 0.97;
  if (expiryDays <= 90) return 0.95;
  if (expiryDays <= 120) return 0.94;
  if (expiryDays <= 180) return 0.93;
  return 0.92; // Long-dated converges to lower vol
}

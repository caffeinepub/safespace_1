/**
 * Simple linear regression utility using least-squares method
 */

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
}

/**
 * Compute linear regression (y = mx + b) from array of (x, y) points
 * Returns slope, intercept, and a predict function
 */
export function linearRegression(points: Array<{ x: number; y: number }>): LinearRegressionResult | null {
  if (points.length < 2) {
    return null;
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  
  // Avoid division by zero
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x: number) => slope * x + intercept,
  };
}

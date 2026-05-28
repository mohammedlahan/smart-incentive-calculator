export interface Slab {
  id: string;
  minRange: number;
  maxRange: number | null;
  incentivePerCar: number;
}

export interface CalculationResult {
  totalSales: number;
  ratePerCar: number;
  totalIncentive: number;
  currentSlab: Slab | null;
  nextSlab: Slab | null;
  carsNeededForNextSlab: number | null;
}

/**
 * Computes incentive metrics using the Flat-Tier model.
 * The rate of the highest reached slab is applied to ALL cars sold.
 */
export function calculateIncentive(totalCars: number, slabs: Slab[]): CalculationResult {
  if (totalCars <= 0 || slabs.length === 0) {
    // Find the very first slab as the next target
    const sortedSlabs = [...slabs].sort((a, b) => a.minRange - b.minRange);
    const nextSlab = sortedSlabs[0] || null;
    return {
      totalSales: totalCars,
      ratePerCar: 0,
      totalIncentive: 0,
      currentSlab: null,
      nextSlab,
      carsNeededForNextSlab: nextSlab ? nextSlab.minRange - totalCars : null,
    };
  }

  // Sort slabs by minRange ascending
  const sortedSlabs = [...slabs].sort((a, b) => a.minRange - b.minRange);
  
  let currentSlab: Slab | null = null;
  
  // Find current slab matching totalCars
  for (const slab of sortedSlabs) {
    const isWithinMin = totalCars >= slab.minRange;
    const isWithinMax = slab.maxRange === null || totalCars <= slab.maxRange;
    if (isWithinMin && isWithinMax) {
      currentSlab = slab;
      break;
    }
  }
  
  const ratePerCar = currentSlab ? currentSlab.incentivePerCar : 0;
  const totalIncentive = totalCars * ratePerCar;
  
  // Find next slab to show goal tracker
  let nextSlab: Slab | null = null;
  if (currentSlab) {
    const currentIndex = sortedSlabs.findIndex(s => s.id === currentSlab!.id);
    if (currentIndex !== -1 && currentIndex < sortedSlabs.length - 1) {
      nextSlab = sortedSlabs[currentIndex + 1];
    }
  } else {
    // If not matched, it might be between slabs or below the first slab
    for (const slab of sortedSlabs) {
      if (totalCars < slab.minRange) {
        nextSlab = slab;
        break;
      }
    }
  }
  
  const carsNeededForNextSlab = nextSlab ? nextSlab.minRange - totalCars : null;
  
  return {
    totalSales: totalCars,
    ratePerCar,
    totalIncentive,
    currentSlab,
    nextSlab,
    carsNeededForNextSlab,
  };
}

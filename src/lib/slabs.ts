export interface SlabRange {
  id?: string;
  minRange: number;
  maxRange: number | null;
}

/**
 * Checks if a proposed slab range overlaps with any existing slabs.
 * Range bounds are inclusive. A null maxRange represents infinity (e.g., "8+").
 */
export function isSlabOverlapping(
  newMin: number,
  newMax: number | null,
  existingSlabs: SlabRange[],
  ignoreId?: string
): boolean {
  // Validate basic range bounds first (e.g. min <= max)
  if (newMax !== null && newMin > newMax) {
    return true; // Invalid range itself, treat as overlap/invalid
  }

  for (const slab of existingSlabs) {
    if (ignoreId && slab.id === ignoreId) continue;

    // Overlap checks
    // Cond 1: newMin is less than or equal to existing max (if existing max is not infinite)
    const cond1 = slab.maxRange === null || newMin <= slab.maxRange;
    
    // Cond 2: newMax is greater than or equal to existing min (if new max is not infinite)
    const cond2 = newMax === null || newMax >= slab.minRange;

    if (cond1 && cond2) {
      return true; // Overlap found
    }
  }

  return false;
}

/**
 * Validates slab ranges ordering and format.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateSlabRange(
  minRange: number,
  maxRange: number | null,
  existingSlabs: SlabRange[],
  ignoreId?: string
): string | null {
  if (minRange < 0) {
    return 'Minimum range must be a positive integer.';
  }
  if (maxRange !== null && maxRange < minRange) {
    return 'Maximum range must be greater than or equal to minimum range.';
  }
  
  const overlaps = isSlabOverlapping(minRange, maxRange, existingSlabs, ignoreId);
  if (overlaps) {
    return 'This range overlaps with an existing incentive slab.';
  }

  return null;
}

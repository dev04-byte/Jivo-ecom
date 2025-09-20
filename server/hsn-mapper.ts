// HSN Code mapping for common product categories
// This helps auto-populate HSN codes when they're not directly available in the data

interface HsnMapping {
  keywords: string[];
  hsn: string;
  description: string;
}

const hsnMappings: HsnMapping[] = [
  // Edible Oils
  { keywords: ['rice bran', 'ricebran'], hsn: '15079090', description: 'Rice bran oil' },
  { keywords: ['canola', 'rapeseed'], hsn: '15141110', description: 'Canola/Rapeseed oil' },
  { keywords: ['olive oil', 'olive pomace'], hsn: '15099010', description: 'Olive oil' },
  { keywords: ['mustard oil', 'kachi ghani'], hsn: '15144010', description: 'Mustard oil' },
  { keywords: ['groundnut', 'peanut'], hsn: '15081010', description: 'Groundnut/Peanut oil' },
  { keywords: ['sunflower'], hsn: '15121110', description: 'Sunflower oil' },
  { keywords: ['coconut oil'], hsn: '15131110', description: 'Coconut oil' },
  { keywords: ['sesame', 'gingelly'], hsn: '15155010', description: 'Sesame oil' },
  { keywords: ['soybean', 'soya'], hsn: '15079010', description: 'Soybean oil' },
  { keywords: ['palm oil'], hsn: '15119010', description: 'Palm oil' },
  { keywords: ['cottonseed'], hsn: '15122910', description: 'Cottonseed oil' },
  { keywords: ['edible oil', 'cooking oil', 'refined oil'], hsn: '15179090', description: 'Other edible oils' },

  // Ghee
  { keywords: ['ghee', 'clarified butter'], hsn: '04059020', description: 'Ghee' },

  // Food Products
  { keywords: ['atta', 'wheat flour'], hsn: '11010000', description: 'Wheat flour' },
  { keywords: ['maida', 'refined flour'], hsn: '11010000', description: 'Refined wheat flour' },
  { keywords: ['rice', 'basmati', 'chawal'], hsn: '10063020', description: 'Rice' },
  { keywords: ['dal', 'lentil', 'pulse'], hsn: '07133100', description: 'Pulses/Lentils' },
  { keywords: ['sugar', 'chini'], hsn: '17019990', description: 'Sugar' },
  { keywords: ['salt', 'namak'], hsn: '25010020', description: 'Salt' },
  { keywords: ['tea', 'chai'], hsn: '09021000', description: 'Tea' },
  { keywords: ['coffee'], hsn: '09011110', description: 'Coffee' },

  // Spices
  { keywords: ['masala', 'spice', 'spices'], hsn: '09109990', description: 'Mixed spices' },
  { keywords: ['turmeric', 'haldi'], hsn: '09103000', description: 'Turmeric' },
  { keywords: ['chilli', 'mirch'], hsn: '09042110', description: 'Chilli powder' },
  { keywords: ['coriander', 'dhania'], hsn: '09092100', description: 'Coriander' },
  { keywords: ['cumin', 'jeera'], hsn: '09093100', description: 'Cumin' },

  // Dairy
  { keywords: ['milk', 'doodh'], hsn: '04011010', description: 'Milk' },
  { keywords: ['butter', 'makhan'], hsn: '04051000', description: 'Butter' },
  { keywords: ['cheese', 'paneer'], hsn: '04061010', description: 'Cheese/Paneer' },
  { keywords: ['yogurt', 'curd', 'dahi'], hsn: '04031000', description: 'Yogurt/Curd' },

  // Beverages
  { keywords: ['juice', 'fruit juice'], hsn: '20098990', description: 'Fruit juice' },
  { keywords: ['soft drink', 'cola', 'soda'], hsn: '22021010', description: 'Soft drinks' },
  { keywords: ['water', 'mineral water'], hsn: '22011010', description: 'Packaged water' },

  // Snacks
  { keywords: ['chips', 'namkeen', 'snacks'], hsn: '19059090', description: 'Snacks' },
  { keywords: ['biscuit', 'cookie'], hsn: '19053100', description: 'Biscuits' },
  { keywords: ['chocolate'], hsn: '18069010', description: 'Chocolate' },
  { keywords: ['candy', 'toffee'], hsn: '17049090', description: 'Candy/Confectionery' },
];

/**
 * Find HSN code based on product description
 * @param productDescription The product description to search for HSN code
 * @returns HSN code if found, null otherwise
 */
export function findHsnByDescription(productDescription: string): string | null {
  if (!productDescription) return null;

  const descLower = productDescription.toLowerCase();

  for (const mapping of hsnMappings) {
    for (const keyword of mapping.keywords) {
      if (descLower.includes(keyword.toLowerCase())) {
        return mapping.hsn;
      }
    }
  }

  return null;
}

/**
 * Extract or infer HSN code from various data sources
 * @param data Object containing various fields that might contain HSN information
 * @returns HSN code if found or inferred, null otherwise
 */
export function extractHsnCode(data: {
  hsnCode?: string | null;
  description?: string | null;
  category?: string | null;
  brandName?: string | null;
  [key: string]: any;
}): string | null {
  // First check if HSN code is directly provided
  if (data.hsnCode && /^\d{6,8}$/.test(data.hsnCode)) {
    return data.hsnCode;
  }

  // Try to extract from description (pattern: HSN: XXXXXXXX)
  if (data.description) {
    const hsnMatch = data.description.match(/HSN[:\s]*([\d]{6,8})/i);
    if (hsnMatch) {
      return hsnMatch[1];
    }
  }

  // Try to extract 8-digit number from brand name or category
  const fields = [data.brandName, data.category];
  for (const field of fields) {
    if (field) {
      const match = field.match(/\b(\d{8})\b/);
      if (match) {
        return match[1];
      }
    }
  }

  // Try to infer from product description
  if (data.description) {
    const inferredHsn = findHsnByDescription(data.description);
    if (inferredHsn) {
      return inferredHsn;
    }
  }

  // Try to infer from category
  if (data.category) {
    const inferredHsn = findHsnByDescription(data.category);
    if (inferredHsn) {
      return inferredHsn;
    }
  }

  return null;
}

/**
 * Get HSN description by code
 * @param hsnCode The HSN code to lookup
 * @returns Description of the HSN code
 */
export function getHsnDescription(hsnCode: string): string {
  for (const mapping of hsnMappings) {
    if (mapping.hsn === hsnCode) {
      return mapping.description;
    }
  }
  return 'Product';
}
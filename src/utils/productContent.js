/** Amazon-style product copy templates for trendkaari (original, brand-safe). */

const SIZE_CHART_APPAREL = [
  { size: 'S', chest: '34 – 36', shoulder: '16.5', length: '27.5', sleeve: '7.5' },
  { size: 'M', chest: '36 – 38', shoulder: '17', length: '28.2', sleeve: '8' },
  { size: 'L', chest: '38 – 41', shoulder: '17.8', length: '29', sleeve: '8.5' },
  { size: 'XL', chest: '41 – 44', shoulder: '18.5', length: '29.8', sleeve: '9' },
  { size: 'XXL', chest: '44 – 47', shoulder: '19.2', length: '30.5', sleeve: '9.5' },
];

const SIZE_CHART_ETHNIC = [
  { size: 'XS', chest: '32 – 34', shoulder: '14', length: '38', sleeve: '16' },
  { size: 'S', chest: '34 – 36', shoulder: '14.5', length: '40', sleeve: '17' },
  { size: 'M', chest: '36 – 38', shoulder: '15', length: '42', sleeve: '17.5' },
  { size: 'L', chest: '38 – 40', shoulder: '15.5', length: '44', sleeve: '18' },
  { size: 'XL', chest: '40 – 42', shoulder: '16', length: '46', sleeve: '18.5' },
  { size: 'XXL', chest: '42 – 44', shoulder: '16.5', length: '48', sleeve: '19' },
];

function isMensWestern(product) {
  const sub = (product.subCategory || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  if (cat === 'men' || product.gender === 'gents' || product.wearType === 'gents') {
    return /t-shirt|shirt|hoodie|jacket|jean|blazer|track|coord|bottom|polo/.test(sub);
  }
  return false;
}

function isLehenga(product) {
  return (product.subCategory || '').includes('lehenga');
}

function isSaree(product) {
  return (product.subCategory || '').includes('saree');
}

function fabricFromProduct(product) {
  const tags = product.fabricTags || [];
  if (tags.length) return tags.join(', ');
  const t = (product.title || '').toLowerCase();
  if (t.includes('silk')) return 'Silk Blend';
  if (t.includes('cotton')) return 'Premium Cotton';
  if (t.includes('linen')) return 'Premium Linen';
  if (isMensWestern(product)) return '60% Cotton, 40% Polyester';
  return 'Premium Viscose / Muslin Cotton';
}

function colorFromTitle(title = '') {
  const t = title.toLowerCase();
  if (t.includes('black')) return 'Black';
  if (t.includes('white') || t.includes('ivory')) return 'Ivory / White';
  if (t.includes('navy') || t.includes('blue')) return 'Blue';
  if (t.includes('green') || t.includes('sage') || t.includes('olive')) return 'Green';
  if (t.includes('red') || t.includes('maroon') || t.includes('wine')) return 'Red / Maroon';
  if (t.includes('pink') || t.includes('peach')) return 'Pink / Peach';
  return 'As shown';
}

/** Stable numeric seed so each product gets unique but repeatable copy. */
export function seedFromProduct(product = {}) {
  const raw = [
    product.id,
    product.title,
    product.subCategory,
    product.gender,
    ...(product.fabricTags || []),
  ]
    .filter(Boolean)
    .join('|');
  let h = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    h = (h * 33) ^ raw.charCodeAt(i);
  }
  return Math.abs(h);
}

function pick(seed, list) {
  if (!list?.length) return '';
  return list[seed % list.length];
}

/** Per-product rating & review count (not the same 4.8 / 12 for every SKU). */
export function getDefaultRatingReviews(product = {}) {
  const seed = seedFromProduct(product);
  const rating = Number((4.1 + (seed % 9) * 0.1).toFixed(1));
  const reviewBuckets = [18, 24, 31, 47, 56, 72, 89, 104, 128, 156, 203, 287, 412, 638];
  const reviewsCount = reviewBuckets[(seed >> 4) % reviewBuckets.length];
  return { rating, reviewsCount };
}

function subKey(product) {
  return (product.subCategory || product.category || '').toLowerCase();
}

function mensWesternContent(product) {
  const fabric = fabricFromProduct(product);
  const color = colorFromTitle(product.title);
  const title = product.title || 'this style';
  const sub = subKey(product);
  const seed = seedFromProduct(product);

  const fitBySub = {
    jeans: 'Slim / Straight Fit',
    pants: 'Tapered Fit',
    jackets: 'Regular Outerwear Fit',
    blazers: 'Tailored Fit',
    hoodies: 'Relaxed Fit',
    trackpants: 'Athletic Fit',
    'gents co-ords': 'Coordinated Set Fit',
    'co-ords': 'Coordinated Set Fit',
  };

  const genericNameBySub = {
    shirts: 'Formal / Casual Shirt',
    jeans: 'Denim Jeans',
    pants: 'Trousers',
    jackets: 'Jacket',
    blazers: 'Blazer',
    hoodies: 'Hoodie',
    trackpants: 'Track Pants',
    'gents kurtas': "Men's Kurta",
  };

  const introVariants = [
    `trendkaari presents ${title} in ${color}—built for everyday confidence with ${fabric} comfort.`,
    `Meet ${title}: a ${sub.replace(/gents /, '')} essential from trendkaari, tailored in ${fabric} for modern Indian wardrobes.`,
    `${title} pairs sharp looks with practical ${fabric} construction—ideal when you want style without sacrificing comfort.`,
  ];

  return {
    highlights: {
      'Material composition': fabric,
      Colour: color,
      'Fit type': fitBySub[sub] || (/polo/i.test(title) ? 'Regular Fit' : 'Regular Fit'),
      'Sleeve type': /polo|collar/i.test(title) ? 'Half Sleeve' : sub.includes('jacket') ? 'Full Sleeve' : 'Short / Half Sleeve',
      'Collar style': /polo/i.test(title) ? 'Polo Collar' : sub.includes('hoodie') ? 'Hooded' : 'Round / Spread Collar',
      Length: sub.includes('jean') || sub.includes('pant') ? 'Full Length' : 'Standard Length',
      'Country of Origin': 'India',
    },
    aboutItems: [
      pick(seed, [
        `MATERIAL & FABRIC: ${title} uses ${fabric} for a breathable, easy-care finish—suitable for long days and repeat wear.`,
        `FABRIC FEEL: ${title} is cut in ${fabric} chosen for softness, shape retention and a clean drape on the body.`,
      ]),
      pick(seed + 1, [
        `FIT & SILHOUETTE: ${fitBySub[sub] || 'Regular fit'} gives balanced room through chest and waist—works for office-casual, travel and weekend plans.`,
        `DESIGNED TO MOVE: The cut allows natural movement while keeping a neat line—pair with denim, chinos or co-ord bottoms from trendkaari.`,
      ]),
      pick(seed + 2, [
        `COLOUR & FINISH: ${color} tone is selected to stay versatile across seasons; quality stitching supports daily rotation.`,
        `STYLE NOTE: ${color} shade complements both neutral and bold layering pieces in your closet.`,
      ]),
      `CARE: Follow garment label—gentle machine wash cold for cotton blends; dry flat or line dry in shade to protect colour.`,
      pick(seed + 3, [
        `OCCASION: Smart choice for brunch, casual meetings, gym-to-street looks and gifting within trendkaari menswear.`,
        `VERSATILE WEAR: Dress up with loafers or keep it relaxed with sneakers—${title} adapts to your schedule.`,
      ]),
    ],
    descriptionLong: pick(seed, introVariants),
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Item Weight': sub.includes('jacket') || sub.includes('blazer') ? 'Approx. 650 g' : 'Approx. 250–380 g',
      'Item Dimensions': 'Packaged dimensions vary by size',
      'Net Quantity': sub.includes('co-ord') ? '1 Set' : '1 Count',
      'Generic Name': genericNameBySub[sub] || (/polo/i.test(title) ? 'Polo Shirt' : 'Topwear'),
      'Product Care': 'Machine wash cold, do not bleach, dry in shade',
      Colour: color,
    },
    sizeChart: SIZE_CHART_APPAREL,
    sizeChartType: 'mens',
  };
}

function lehengaContent(product) {
  const fabric = fabricFromProduct(product);
  const title = product.title || 'this lehenga';
  const seed = seedFromProduct(product);
  return {
    highlights: {
      'Material composition': fabric,
      'Fit type': 'Flared / A-line',
      'Dupatta': pick(seed, ['Included', 'Net / Georgette dupatta included', 'Contrast dupatta included']),
      Embroidery: pick(seed + 1, ['Zari / thread work', 'Foil & sequin accents', 'Hand-finished borders']),
      Length: 'Full Length',
      'Country of Origin': 'India',
    },
    aboutItems: [
      `PREMIUM FABRIC: ${title} is tailored in ${fabric} for rich drape and a festive silhouette—comfortable through long ceremonies.`,
      `SET INCLUDES: Lehenga, choli & dupatta coordinated for a complete look—minimal styling needed.`,
      pick(seed, [
        `OCCASION: Ideal for weddings, sangeet, reception and engagement celebrations.`,
        `STYLING: Works beautifully with statement earrings and embellished heels—trendkaari ethnic bestseller.`,
      ]),
      `COMFORT: Lightweight lining and breathable layers help you move and dance with ease.`,
      `CARE: Dry clean recommended; store in a garment bag away from direct heat.`,
    ],
    descriptionLong: pick(seed, [
      `${title} brings celebratory drama in ${fabric}—crafted for bridesmaids, wedding guests and festive evenings.`,
      `trendkaari ${title}: a lehenga set designed for memorable occasions with balanced flare and refined finishing.`,
    ]),
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Net Quantity': '1 Set (Lehenga + Choli + Dupatta)',
      'Item Weight': 'Approx. 800 g – 1.2 kg',
      'Generic Name': 'Lehenga Choli Set',
      'Ideal For': 'Wedding, festive, party wear',
      'Product Care': 'Dry clean only',
    },
    sizeChart: SIZE_CHART_ETHNIC,
    sizeChartType: 'ethnic',
  };
}

function sareeContent(product) {
  const fabric = fabricFromProduct(product);
  const title = product.title || 'this saree';
  const seed = seedFromProduct(product);
  return {
    highlights: {
      'Material composition': fabric,
      'Saree length': pick(seed, ['5.5 m', '6 m with blouse piece', '5.8 m unstitched blouse']),
      'Blouse piece': 'Included (unstitched)',
      Border: pick(seed + 1, ['Contrast zari border', 'Woven temple border', 'Printed border']),
      Pattern: pick(seed + 2, ['Banarasi-inspired weave', 'Floral jaal', 'Geometric motif']),
      'Country of Origin': 'India',
    },
    aboutItems: [
      `FABRIC & DRAPE: ${title} in ${fabric} falls elegantly with a structured pleat and soft pallu flow.`,
      `BLOUSE PIECE: Unstitched blouse fabric included—tailor to your preferred neckline and sleeve.`,
      `STYLING TIP: Pair with trendkaari jewellery and heels; add a belted blouse for contemporary flair.`,
      `OCCASION: Perfect for pujas, receptions, office ethnic days and family functions.`,
      `CARE: Dry clean first wear; steam on low heat; avoid harsh wringing.`,
    ],
    descriptionLong: `${title} from trendkaari celebrates classic Indian drape with modern colour stories in ${fabric}.`,
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Net Quantity': '1 Saree + Blouse Piece',
      'Generic Name': 'Saree with Blouse Piece',
      'Ideal For': 'Festive & formal ethnic',
      'Product Care': 'Dry clean / gentle hand wash',
    },
    sizeChart: SIZE_CHART_ETHNIC,
    sizeChartType: 'ethnic',
  };
}

function kurtaContent(product) {
  const fabric = fabricFromProduct(product);
  const title = product.title || 'this kurta';
  const seed = seedFromProduct(product);
  const isGents = product.gender === 'gents' || (product.category || '').toLowerCase() === 'men';
  return {
    highlights: {
      'Material composition': fabric,
      'Fit type': isGents ? 'Straight Kurta Fit' : 'Regular / Straight Fit',
      'Sleeve type': pick(seed, ['Three-Quarter Sleeves', 'Full Sleeves', 'Short Sleeves']),
      'Neck style': pick(seed + 1, ['Mandarin Collar', 'Round Neck', 'Band Collar']),
      Length: isGents ? 'Knee Length' : 'Standard / Midi Length',
      'Country of Origin': 'India',
    },
    aboutItems: [
      `PREMIUM FABRIC: ${title} is made in ${fabric} for breathable comfort through day-long wear.`,
      `CRAFT: Clean finishing, reinforced seams and colour-fast dyeing—trendkaari quality checks on every piece.`,
      pick(seed, [
        `VERSATILE: Style with palazzos, churidar, denims or Nehru jacket depending on the occasion.`,
        `EVERYDAY ETHNIC: From office ethnic Friday to family dinners—easy to dress up or down.`,
      ]),
      `COMFORT: Room through chest and hip for movement; soft hand-feel against skin.`,
      `CARE: Gentle machine wash or hand wash in cold water; iron on reverse.`,
    ],
    descriptionLong: pick(seed, [
      `${title}—a trendkaari ${isGents ? "men's" : "women's"} kurta in ${fabric}, designed for effortless Indian dressing.`,
      `Discover ${title}: contemporary cuts with traditional ease, ideal for festivals and daily ethnic style.`,
    ]),
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Net Quantity': '1 Count',
      'Generic Name': isGents ? "Men's Kurta" : 'Kurta',
      'Ideal For': 'Festive, casual ethnic, workwear',
      'Product Care': 'Gentle wash, dry in shade',
    },
    sizeChart: SIZE_CHART_ETHNIC,
    sizeChartType: 'ethnic',
  };
}

function westernLadiesContent(product) {
  const fabric = fabricFromProduct(product);
  const title = product.title || 'this piece';
  const sub = subKey(product);
  const seed = seedFromProduct(product);

  const typeLabel =
    sub.includes('dress') ? 'Dress'
    : sub.includes('top') ? 'Top'
    : sub.includes('bottom') ? 'Bottom'
    : sub.includes('co-ord') ? 'Co-ord Set'
    : 'Western Wear';

  return {
    highlights: {
      'Material composition': fabric,
      'Fit type': pick(seed, ['Regular Fit', 'Relaxed Fit', 'Fitted']),
      'Neck style': pick(seed + 1, ['Round Neck', 'V-Neck', 'Square Neck']),
      Length: sub.includes('dress') ? 'Midi / Maxi' : 'Standard',
      Pattern: pick(seed + 2, ['Solid', 'Printed', 'Striped / textured']),
      'Country of Origin': 'India',
    },
    aboutItems: [
      `FABRIC: ${title} in ${fabric} feels light on skin and easy to layer across seasons.`,
      `STYLE: ${typeLabel} from trendkaari—pair with sneakers, sandals or heels as you like.`,
      `COMFORT: Thoughtful cut for movement; ideal for brunch, travel and casual outings.`,
      `CARE: Machine wash cold with similar colours; do not bleach.`,
      pick(seed, [
        `WARDROBE TIP: Mix with trendkaari accessories for a complete day-to-night look.`,
        `VERSATILE: Dress up with a jacket or keep minimal for everyday ease.`,
      ]),
    ],
    descriptionLong: `${title} adds a fresh ${typeLabel.toLowerCase()} option to your trendkaari wardrobe—${fabric} construction with modern Indian sensibility.`,
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Net Quantity': sub.includes('co-ord') ? '1 Set' : '1 Count',
      'Generic Name': typeLabel,
      'Product Care': 'Machine wash cold',
    },
    sizeChart: SIZE_CHART_APPAREL,
    sizeChartType: 'ladies-western',
  };
}

function ethnicLadiesContent(product) {
  const fabric = fabricFromProduct(product);
  const sub = product.subCategory || 'ethnic wear';
  const title = product.title || 'this piece';
  const seed = seedFromProduct(product);

  return {
    highlights: {
      'Material composition': fabric,
      'Fit type': pick(seed, ['Regular / Straight Fit', 'A-line', 'Comfort Fit']),
      'Sleeve type': pick(seed + 1, ['Three-Quarter Sleeves', 'Sleeveless', 'Full Sleeves']),
      'Neck style': pick(seed + 2, ['Designer Neckline', 'Round Neck', 'V-Neck']),
      Length: 'Standard Length',
      Pattern: pick(seed + 3, ['Ethnic weave', 'Block print', 'Embroidered yoke']),
      'Country of Origin': 'India',
    },
    aboutItems: [
      `PREMIUM FABRIC: ${title} uses ${fabric} for graceful drape and breathability—festive-ready yet comfortable.`,
      `DESIGN: ${sub} styling with refined finishing—complements Indian body types.`,
      pick(seed, [
        `VERSATILE: Pair with minimal jewellery for events or keep it light for brunch.`,
        `OCCASION: Wedding guest, puja, cocktail ethnic and family gatherings.`,
      ]),
      `COMFORT FIT: Ease of movement without compromising elegance.`,
      `CARE: Dry clean recommended first wear; gentle hand wash thereafter.`,
    ],
    descriptionLong: pick(seed, [
      `Discover ${title} from trendkaari—${sub} in ${fabric} for celebrations and special days.`,
      `${title}: where tradition meets contemporary design in premium ${fabric}.`,
    ]),
    additionalInfo: {
      Manufacturer: 'trendkaari, India',
      'Country of Origin': 'India',
      'Net Quantity': sub.includes('set') || sub.includes('dupatta') ? '1 Set' : '1 Count',
      'Item Weight': 'Approx. 400–650 g',
      'Generic Name': product.subCategory || 'Ethnic Wear',
      'Ideal For': pick(seed, ['Festive & party', 'Wedding guest', 'Daily ethnic']),
      'Product Care': 'Dry clean / gentle hand wash',
    },
    sizeChart: SIZE_CHART_ETHNIC,
    sizeChartType: 'ethnic',
  };
}

function resolveGeneratedContent(product) {
  const sub = subKey(product);
  if (isLehenga(product) || sub.includes('lehenga')) return lehengaContent(product);
  if (isSaree(product) || sub.includes('saree')) return sareeContent(product);
  if (sub.includes('kurta')) return kurtaContent(product);
  if (isMensWestern(product)) return mensWesternContent(product);
  if (
    sub.includes('dress') ||
    sub.includes('top') ||
    sub.includes('bottom') ||
    sub.includes('t-shirt') ||
    (sub.includes('co-ord') && product.gender !== 'gents')
  ) {
    return westernLadiesContent(product);
  }
  if (product.gender === 'gents' || (product.category || '').toLowerCase() === 'men') {
    return mensWesternContent(product);
  }
  return ethnicLadiesContent(product);
}

export function getProductDetailContent(product) {
  if (!product) return null;

  const hasStoredDetails =
    (product.highlights && Object.keys(product.highlights).length > 0) ||
    (product.aboutItems && product.aboutItems.length > 0) ||
    Boolean(product.descriptionLong?.trim());

  if (hasStoredDetails) {
    const generated = resolveGeneratedContent(product);
    return {
      highlights: product.highlights || generated.highlights,
      aboutItems: product.aboutItems?.length ? product.aboutItems : generated.aboutItems,
      descriptionLong: product.descriptionLong || product.description || generated.descriptionLong,
      additionalInfo:
        product.additionalInfo && Object.keys(product.additionalInfo).length
          ? product.additionalInfo
          : generated.additionalInfo,
      sizeChart:
        product.sizeChart?.length
          ? product.sizeChart
          : generated.sizeChart,
      sizeChartType: product.sizeChartType || generated.sizeChartType,
    };
  }

  return resolveGeneratedContent(product);
}

function hasNonEmptyObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    Object.entries(obj).some(([, v]) => String(v ?? '').trim())
  );
}

function hasNonEmptyLines(lines) {
  return Array.isArray(lines) && lines.some((line) => String(line).trim());
}

/** Merge admin payload with auto-generated PDP copy when fields are left blank. */
export function applyProductDetailDefaults(product) {
  if (!product) return product;

  const generated = getProductDetailContent({
    title: product.title,
    description: product.description,
    subCategory: product.subCategory,
    category: product.category,
    gender: product.gender,
    wearType: product.wearType,
    fabricTags: product.fabricTags,
    price: product.price,
    originalPrice: product.originalPrice,
  });

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const autoDiscount =
    originalPrice > price
      ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
      : 'SPECIAL OFFER';

  return {
    ...product,
    description:
      String(product.description || '').trim() ||
      String(generated.descriptionLong || '').slice(0, 320),
    descriptionLong:
      String(product.descriptionLong || '').trim() ||
      generated.descriptionLong ||
      product.description ||
      '',
    highlights: hasNonEmptyObject(product.highlights)
      ? product.highlights
      : generated.highlights,
    aboutItems: hasNonEmptyLines(product.aboutItems)
      ? product.aboutItems.filter((line) => String(line).trim())
      : generated.aboutItems,
    additionalInfo: hasNonEmptyObject(product.additionalInfo)
      ? product.additionalInfo
      : generated.additionalInfo,
    sizeChart: product.sizeChart?.length ? product.sizeChart : generated.sizeChart,
    sizeChartType: product.sizeChartType || generated.sizeChartType,
    discount: String(product.discount || '').trim() || autoDiscount,
    rating:
      product.rating != null && product.rating !== ''
        ? Number(product.rating)
        : getDefaultRatingReviews(product).rating,
    reviewsCount:
      product.reviewsCount != null && product.reviewsCount !== ''
        ? Number(product.reviewsCount)
        : getDefaultRatingReviews(product).reviewsCount,
  };
}

export function getSizeChartForProduct(product) {
  const content = getProductDetailContent(product);
  return content?.sizeChart || SIZE_CHART_ETHNIC;
}

/** Split "LABEL: body text" bullets like Amazon About this item */
export function parseAboutBullet(text) {
  const idx = text.indexOf(':');
  if (idx <= 0) return { label: '', body: text };
  return {
    label: text.slice(0, idx).trim(),
    body: text.slice(idx + 1).trim(),
  };
}

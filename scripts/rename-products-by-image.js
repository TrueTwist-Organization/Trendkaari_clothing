#!/usr/bin/env node
/**
 * Rename all product titles to match garment colors seen in product images.
 * Curated maps for ethnic/western categories + filename hints for mens catalog.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyProductDetailDefaults } from '../src/utils/productContent.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

/** Image-verified titles (garment color matches photo) */
const TITLE_BY_ID = {
  // dupatta sets — already verified
  241: 'Deep Teal Cotton Printed Dupatta Set',
  242: 'Indigo Teal Block Print Dupatta Set',
  243: 'Rose Pink Magenta Silk Dupatta Kurta Set',
  244: 'Mustard Yellow Floral Print Dupatta Set',
  245: 'Coral Red Sharara Gota Dupatta Set',
  246: 'Mustard Yellow Peplum Skirt Dupatta Set',
  247: 'Sage Mint Green Organza Dupatta Set',
  248: 'Ruby Red Bandhej Kota Dupatta Set',
  249: 'Blush Rose Pink Embroidered Dupatta Set',
  250: 'Deep Plum Purple Anarkali Dupatta Set',

  // kurtas
  1000: 'Ruby Red Gota Striped Straight Kurta Set',
  1001: 'Mustard Yellow Layered Festive Kurta Set',
  1002: 'Mustard Yellow Gota Striped Cotton Kurta',
  1003: 'Sage Green Chikankari Embroidered Kurta Set',
  1004: 'Rose Pink Dhoti Style Kurti Set',
  1005: 'Black Floral Printed Sharara Kurta Set',
  1006: 'Lavender Purple Organza Straight Kurta Set',
  1007: 'Tan Brown Organza Palazzo Kurta Set',
  1008: 'Rose Pink Chikankari Palazzo Kurta Set',
  1009: 'Ruby Red Mirror Work Sleeveless Kurta',

  // lehengas
  1010: 'Multicolor Floral Print Lehenga Choli',
  1011: 'Lavender Purple Floral Print Lehenga',
  1012: 'Wine Maroon Mirror Work Brocade Lehenga',
  1013: 'Teal Blue Banarasi Brocade Lehenga Choli',
  1014: 'Coral Orange Leheriya Print Lehenga Choli',
  1015: 'Multicolor Mirror Work Festive Lehenga',
  1016: 'Ruby Red Embroidered Bridal Lehenga',
  1017: 'Blush Rose Pink Gota Striped Lehenga',
  1018: 'Deep Teal Velvet Sequin Lehenga',
  1019: 'Ruby Red Bandhani Print Lehenga',

  // sarees
  1020: 'Sage Green Sequin Border Saree',
  1021: 'Aqua Teal Pre-Draped Saree Gown',
  1022: 'Sky Blue Chiffon Saree',
  1023: 'Peach Orange Sequin Chiffon Saree',
  1024: 'Aqua Teal Ombre Chiffon Saree',
  1025: 'Blush Rose Pink Ombre Saree',
  1026: 'Black Sequin Floral Saree',
  1027: 'Emerald Green Pre-Stitched Saree',
  1028: 'Ruby Red Gold Border Silk Saree',
  1029: 'Sage Green Floral Print Saree',

  // suit sets
  1030: 'Coral Red Floral Palazzo Suit Set',
  1031: 'Mustard Yellow Floral Sharara Suit Set',
  1032: 'Lime Green Anarkali Palazzo Suit Set',
  1033: 'Mustard Yellow Anarkali Suit Set',
  1034: 'Ruby Red Floral Dupatta Suit Set',
  1035: 'Deep Teal Anarkali Gown Suit Set',
  1036: 'Mustard Yellow Patiala Suit Set',
  1037: 'Blush Rose Pink Patiala Suit Set',
  1038: 'Mustard Yellow Anarkali Suit Set',
  1039: 'Mustard Yellow Mirror Work Salwar Suit Set',

  // tops
  1041: 'Sage Mint Green Striped Peplum Top',
  1042: 'Tan Brown Peplum Blazer Top',
  1043: 'Wine Magenta Satin Puff Sleeve Top',
  1044: 'Mustard Yellow Puff Sleeve Peplum Top',
  1045: 'Ivory White Textured Peplum Top',
  1046: 'Blush Rose Pink Gingham Peplum Top',
  1047: 'Lavender Purple Button-Down Peplum Top',
  1048: 'Black Mandarin Collar Tunic Top',
  1049: 'Ruby Red Smocked Glitter Top',
  1050: 'Powder Blue Gingham Tie-Front Peplum Top',

  // dresses
  2001: 'Royal Purple Bow Detail Maxi Dress',
  2002: 'Ivory Navy Floral Block Print Maxi Dress',
  2003: 'Blush Rose Pink Tiered Metallic Dress',
  2004: 'Rose Pink Magenta Ruffle Tiered Dress',
  2005: 'Mustard Yellow Pleated Maxi Gown',
  2006: 'Powder Blue Blush Pink Wrap Cut-Out Dress',
  2007: 'Blush Rose Pink Slit Maxi Dress',
  2008: 'Rose Pink Magenta Tiered Ruffle Gown',
  2009: 'Coral Orange One-Shoulder Maxi Dress',

  // co-ords
  2101: 'Wine Maroon Linen Co-ord Set',
  2102: 'Blush Rose Pink Stripe Co-ord Set',
  2103: 'Midnight Navy Polka Dot Co-ord Set',
  2104: 'Rust Orange Block Print Co-ord Set',
  2105: 'Mustard Yellow Chikankari Co-ord Set',
  2106: 'Black Floral Embroidered Co-ord Set',
  2107: 'Lime Green Leheriya Co-ord Set',
  2108: 'Ruby Red Ethnic Print Co-ord Set',
  2109: 'Ivory White Elephant Motif Co-ord Set',
  2110: 'Lavender Purple Floral Co-ord Set',

  // women's t-shirts
  2201: 'Tan Brown Graphic Oversized T-Shirt',
  2202: 'Ivory White California Bear Graphic Oversized Tee',
  2203: 'Wine Maroon Peace & Love Graphic T-Shirt',
  2204: 'Midnight Navy Basic Crewneck T-Shirt',
  2205: 'Sage Green Ribbed Stripe T-Shirt',
  2206: 'Lime Yellow Have a Good Day Graphic Tee',
  2207: 'Sky Blue Contrast Collar Polo T-Shirt',
  2208: 'Ivory Beige Oversized Combo T-Shirt',
  2209: 'Black Classic Polo T-Shirt',
  2210: 'Wine Maroon Ribbed Long Sleeve Top',

  // bottoms
  2301: 'Black Flared High-Waist Leggings',
  2302: 'Ivory White Pleated Wide-Leg Trousers',
  2303: 'Sage Mint Green Wide-Leg Palazzo Pants',
  2304: 'Emerald Green Cigarette Ankle Pants',
  2305: 'Sky Blue Wide-Leg Denim Jeans',
  2306: 'Royal Blue Flared High-Waist Jeans',
  2307: 'Mustard Yellow Vintage Wash Wide-Leg Jeans',
  2308: 'Sky Blue Ripped Wide-Leg Jeans',
  2309: 'Midnight Navy Skinny Denim Jeans',
  2310: 'Sky Blue Drawstring Wide-Leg Culottes',

  // men's trackpants
  3001: 'Light Grey Neon Stripe Trackpants',
  3002: 'Black Quick-Dry Sports Jogger',
  3003: 'Black Side-Stripe Trackpants',
  3004: 'Khaki Black Side-Stripe Trackpants',
  3005: 'Light Grey Triple Stripe Trackpants',
  3006: 'Black Red Stripe Trackpants',
  3007: 'Heather Grey Side-Piping Trackpants',
  3008: 'Sky Blue Straight Relaxed Trackpants',
  3009: 'Midnight Navy Beige Side-Stripe Trackpants',
  3010: 'Black Elastic Cuff Jogger Trackpants',

  // men's jackets
  3101: 'Olive Green Lightweight Puffer Jacket',
  3102: 'Royal Blue Color-Block Hooded Jacket',
  3103: 'Charcoal Grey Quilted Puffer Jacket',
  3104: 'Midnight Navy Zip-Up Sport Jacket',
  3105: 'Medium Grey Athletic Zip-Up Jacket',
  3106: 'Mustard Yellow Quilted Puffer Jacket',
  3107: 'Light Grey Hooded Puffer Jacket',
  3108: 'Midnight Navy Sage Green Hooded Parka',
  3109: 'Black Mock Neck Bomber Jacket',
  3110: 'Black Leather Biker Jacket',

  // men's hoodies
  3201: 'Deep Teal Premium Heavyweight Hoodie',
  3202: 'Sky Blue Dragon Graphic Hoodie',
  3203: 'Black Being Creative Graphic Hoodie',
  3204: 'Light Grey Monster Graphic Hoodie',
  3205: 'Ruby Red Graphic Chest Print Hoodie',
  3206: 'Olive Green Graphic Fleece Hoodie',
  3207: 'Wine Maroon New York Graphic Hoodie',
  3208: 'Mint Green Being Wanted Graphic Hoodie',
  3209: 'Lavender Purple Soft Cotton Hoodie',
  3210: 'Blush Rose Pink Oversized Hoodie',

  // men's blazers
  3301: 'Midnight Navy Structured Slim-Fit Blazer',
  3302: 'Black Formal Slim-Fit Blazer',
  3303: 'Black Royal Velvet Evening Blazer',
  3304: 'Charcoal Grey Plaid Double-Breasted Blazer',
  3305: 'Charcoal Grey Formal Slim-Fit Blazer',
  3306: 'Midnight Navy Velvet Bandhgala Blazer',
  3307: 'Emerald Green Formal Slim-Fit Blazer',
  3308: 'Midnight Navy Bandhgala Formal Jacket',
  3309: 'Black Bandhgala Jodhpuri Suit',
  3310: 'Forest Green Textured Slim-Fit Blazer',

  // men's co-ords
  3401: 'Black Contrast Stripe Co-ord Set',
  3402: 'Ivory White Graphic Graffiti Print Co-ord Set',
  3403: 'Midnight Navy Paisley Print Resort Co-ord Set',
  3404: 'Light Grey Geometric Print Co-ord Set',
  3405: 'Teal Navy Geometric Print Co-ord Set',
  3406: 'Black Gold Flame Print Co-ord Set',
  3407: 'Chocolate Brown Graffiti Print Co-ord Set',
  3408: 'Light Grey Neon Graphic Cargo Co-ord Set',
  3409: 'Charcoal Grey Linen Blend Co-ord Set',
  3410: 'Ivory Cream Tropical Leaf Print Co-ord Set',

  // men's shirts
  3501: 'Midnight Navy Pure Cotton Oxford Shirt',
  3502: 'Slate Grey Formal Button-Down Shirt',
  3503: 'Wine Maroon Dobby Micro-Print Shirt',
  3504: 'Chocolate Brown Solid Casual Shirt',
  3505: 'Sky Blue Vertical Stripe Casual Shirt',
  3506: 'Black Tropical Print Party Shirt',
  3507: 'Sage Green Tropical Print Camp Shirt',
  3508: 'Mustard Yellow Summer Time Graphic Shirt',
  3509: 'Sky Blue Tropical Beach Print Shirt',
  3510: 'Ivory Cream Tropical Palm Camp Shirt',

  // men's t-shirts
  3601: 'Ivory White Ribbed Long-Sleeve Tee',
  3602: 'Ruby Red Boston Color-Block Polo Tee',
  3603: 'White Black Excellent Graphic T-Shirt',
  3604: 'Tan Brown New York Graphic Pocket Tee',
  3605: 'Olive Green Oversized Drop-Shoulder T-Shirt',
  3606: 'Forest Green Oversized Drop-Shoulder T-Shirt',
  3607: 'Lavender Purple Textured Crew Neck T-Shirt',
  3608: 'Black Quarter-Zip Long-Sleeve Polo Tee',
  3609: 'Blush Rose Pink Ribbed Long Sleeve Tee',
  3610: 'Olive Green Minimal Crewneck Sweatshirt',

  // men's pants
  3701: 'Cream Beige Slim Formal Trousers',
  3702: 'Sage Green Straight-Fit Cotton Trousers',
  3703: 'Black Pleated Smart Office Pants',
  3704: 'Light Grey Pleated Slim Formal Trousers',
  3705: 'Beige Pleated Wide-Leg Trousers',
  3706: 'Black Slim Fit Jeans',
  3707: 'Deep Teal Slim-Fit Chinos',
  3708: 'Black Flared Bootcut Formal Trousers',
  3709: 'Olive Green Slim Ankle Formal Trousers',
  3710: 'Mint Green Slim Fit Chinos',

  // men's jeans
  3801: 'Charcoal Grey Washed Baggy Jeans',
  3802: 'Indigo Blue Cargo Pocket Denim Jeans',
  3803: 'Sky Blue Wide-Leg Baggy Jeans',
  3804: 'Black Acid Wash Baggy Jeans',
  3805: 'Indigo Blue Slim Fit Faded Jeans',
  3806: 'Charcoal Grey Cargo Pocket Utility Jeans',
  3807: 'Chocolate Brown Straight Streetwear Jeans',
  3808: 'Medium Wash Blue Slim Straight Jeans',
  3809: 'Ice Grey Plus Size Slim Straight Jeans',
  3810: 'Charcoal Grey Slim Fit Denim Jeans',

  // men's kurtas
  3901: 'Royal Purple Geometric Print Kurta',
  3902: 'Emerald Green Sequined Festive Kurta',
  3903: 'Lime Green Geometric Print Kurta',
  3904: 'Ivory White Peacock Border Embroidered Kurta',
  3905: 'Lavender Purple Embroidered Festive Kurta',
  3906: 'Wine Maroon Embroidered Ceremonial Kurta Set',
  3907: 'Royal Purple Cotton Threadwork Pathani Kurta',
  3908: 'Mustard Yellow Elephant Border Print Kurta',
  3909: 'Bright Yellow Kalamkari Print Kurta',
  3910: 'Black Red Embroidered Festive Kurta',
};

function replaceTitleInValue(val, oldTitle, newTitle) {
  if (typeof val === 'string') {
    return val.split(oldTitle).join(newTitle);
  }
  if (Array.isArray(val)) {
    return val.map((item) => replaceTitleInValue(item, oldTitle, newTitle));
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = replaceTitleInValue(v, oldTitle, newTitle);
    }
    return out;
  }
  return val;
}

function renameProduct(p) {
  const newTitle = TITLE_BY_ID[p.id];
  if (!newTitle || newTitle === p.title) return { product: p, changed: false };
  const oldTitle = p.title;
  let next = replaceTitleInValue({ ...p, title: newTitle }, oldTitle, newTitle);
  next = applyProductDetailDefaults(next);
  return { product: next, changed: true, oldTitle, newTitle };
}

const { products } = await import('../src/data/products.js');
let changed = 0;
const updated = products.map((p) => {
  const { product, changed: did, oldTitle, newTitle } = renameProduct(p);
  if (did) {
    changed += 1;
    console.log(`  [${p.subCategory}] ${oldTitle} → ${newTitle}`);
  }
  return product;
});

writeFileSync(
  PRODUCTS_PATH,
  `export const products = ${JSON.stringify(updated, null, 2)};\n`,
  'utf8',
);

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));

  store.products = (store.products || []).map((p) => {
    const next = byId.get(p.id);
    if (!next || next.title === p.title) return p;
    return replaceTitleInValue(
      {
        ...p,
        title: next.title,
        description: next.description,
        descriptionLong: next.descriptionLong,
        highlights: next.highlights,
        aboutItems: next.aboutItems,
        additionalInfo: next.additionalInfo,
      },
      p.title,
      next.title,
    );
  });

  if (Array.isArray(store.orders)) {
    store.orders = store.orders.map((order) => {
      if (!order?.items) return order;
      return {
        ...order,
        items: order.items.map((item) => {
          const next = byId.get(item.productId ?? item.id);
          if (!next || next.title === item.title) return item;
          return replaceTitleInValue({ ...item, title: next.title }, item.title, next.title);
        }),
      };
    });
  }

  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`\nRenamed ${changed} products across all categories.`);

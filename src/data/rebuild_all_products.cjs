const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'products.js');
console.log('Reading from path:', productsPath);

// 1. Read existing products
const content = fs.readFileSync(productsPath, 'utf8');
const jsContent = content.replace('export const products =', 'module.exports =');
const existingProducts = eval(jsContent);
console.log('Existing products loaded:', existingProducts.length);

// Filter out all dynamically generated products (IDs >= 2000) and any mock products with external URLs
const baseProducts = existingProducts.filter(p => p.id < 2000 && p.image && !p.image.startsWith('http') && !p.image.startsWith('https'));
console.log('Base products kept (existing categories):', baseProducts.length);

const generatedProducts = [];

// Helper to scan a directory and map webp/png/jpg images
function scanFolderImages(basePath, subfolder, urlPrefix) {
  const folderPath = path.join(basePath, String(subfolder));
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter(f => 
      f.endsWith('.webp') || f.endsWith('.avif') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
    ).sort();
    return files.map(f => `${urlPrefix}/${subfolder}/${f}`);
  }
  return [];
}

// ==================== 1. WOMEN'S DRESSES ====================
const dressesDir = path.join(__dirname, '../../public/dresses/ws/dress');
const dressTitles = [
  "Emerald Green Floral Georgette Midi Dress", "Ruby Crimson Silk Tiered A-Line Dress",
  "Sunshine Gold Block Printed Flare Dress", "Sapphire Navy Cotton Maxi Dress",
  "Classic Ivory Embroidered Tunic Dress", "Sage Olive Linen Button-Down Midi Dress",
  "Pastel Rose Pink Tiered Georgette Dress", "Midnight Violet Velvet Festive Dress",
  "Teal Blossom Hand Block Print Dress"
];
const dressDescriptions = [
  "Indulge in bohemian luxury with our gorgeous emerald green georgette midi dress, showcasing hand-drawn floral graphics, a flattering cinched waist, and elegant flared long sleeves.",
  "Turn heads in this premium silk blend tiered dress in rich ruby crimson. Built with subtle metallic threads that shimmer beautifully in festive evening lights.",
  "Bask in effortless warmth in our sunshine gold flare dress, styled in premium cambric cotton and detailed with signature Rajasthani hand-block print designs.",
  "Sophisticated and relaxed. This premium sapphire navy maxi dress features a modern high-neck collar, side slits, and ultra-soft organic cotton breathable texture.",
  "Drape yourself in absolute timeless elegance with our classic ivory tunic dress, showcasing custom floral chest embroidery and a delicate keyhole neckline.",
  "Crafted in light breathable summer linen, this sage olive midi dress features a classic wooden button-down placket, short roll-up sleeves, and functional side pockets.",
  "A vision in pastel rose pink. This multi-tiered georgette dress is styled with a gorgeous V-neckline and elegant transparent puff sleeve details.",
  "Luxe velvet meets traditional grace. This midnight violet dress is tailored in high-grade ultra-plush velvet fabric, finished with classic gold thread highlights.",
  "Adorned in classic Indian botanical prints. This teal blossom dress is crafted in pure mulmul cotton with an adjustable flared belt sash."
];

if (fs.existsSync(dressesDir)) {
  console.log('Scanning women\'s dresses folder...');
  for (let i = 1; i <= 9; i++) {
    const images = scanFolderImages(dressesDir, i, '/dresses/ws/dress');
    if (images.length > 0) {
      generatedProducts.push({
        id: 2000 + i,
        title: dressTitles[i - 1] || `Premium Designer Dress Edition ${i}`,
        price: 1599 + (i * 120) % 800,
        originalPrice: (1599 + (i * 120) % 800) * 2,
        discount: "50% OFF",
        category: "women",
        subCategory: "dresses",
        wearType: "western",
        image: images[0],
        images: images,
        description: dressDescriptions[i - 1] || "Elegant designer traditional dress crafted in ultra-premium fabric for seamless styling comfort.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        rating: (4.4 + (i * 0.07) % 0.6).toFixed(1),
        reviewsCount: 15 + (i * 24) % 150
      });
    }
  }
}

// ==================== 2. WOMEN'S CO-ORDS ====================
const coordsDir = path.join(__dirname, '../../public/co-ords/co-ord_set');
const coordTitles = [
  "Monochrome Stripe Premium Linen Co-ord Set", "Sage Floral Printed Notch Collar Co-ord Set",
  "Cobalt Blue High-Side Slit Linen Tunic Set", "Pastel Peach Cotton Peplum Trouser Co-ord",
  "Midnight Forest Leaf Print Crepe Co-ord", "Lemon Mustard Linen Waistcoat & Pant Set",
  "Teal Georgette Pleated Blazer Style Co-ord", "Crimson Rose Satin Wrap Kimono Pant Set",
  "Indigo Block-Printed Summer Dobby Set", "Burgundy Linen Lounge Crop & Pants Co-ord"
];
const coordDescriptions = [
  "Look absolutely sharp in our matching monochrome stripe co-ord set, woven in premium high-grade linen, featuring a crisp lapel collar and comfortable tailored trousers.",
  "Embrace breezy daytime outings in our sage green floral printed set, presenting a chic notch collar shirt and matching relaxed-fit palazzo pants.",
  "Daring and elegant. This cobalt blue tunic set features rich high-side slit cuts and an asymmetric hemline, complete with straight breathable trousers.",
  "Flowy and delightful peplum set styled in organic pastel peach cotton dobby fabric, featuring beautiful hand-smocked waist accents.",
  "Chic leaf print crepe set in midnight forest green, designed with wide leg pants and a relaxed drop shoulder wrap tunic shirt.",
  "Modern fusion aesthetic. This lemon mustard set features a structured sleeveless waistcoat and matching smart straight pants.",
  "Sophisticated pleated georgette blazer and trouser ensemble in teal, ideal for upscale casual evenings or elegant office wear.",
  "Luxurious crimson rose wrap set in silky premium satin, showcasing drop sleeves, a secure waist belt, and tailored trousers.",
  "Breathe beautifully in organic indigo dobby. Decorated with traditional block print graphics, featuring a button-up shirt and elasticated trousers.",
  "Relax in pure luxury. This rich burgundy lounge set in washed linen offers absolute comfort with a loose-cropped linen top and high-waist pants."
];

if (fs.existsSync(coordsDir)) {
  console.log('Scanning women\'s co-ords folder...');
  for (let i = 1; i <= 10; i++) {
    const images = scanFolderImages(coordsDir, i, '/co-ords/co-ord_set');
    if (images.length > 0) {
      generatedProducts.push({
        id: 2100 + i,
        title: coordTitles[i - 1] || `Elegant Casual Co-ord Set ${i}`,
        price: 1899 + (i * 150) % 900,
        originalPrice: (1899 + (i * 150) % 900) * 2,
        discount: "50% OFF",
        category: "women",
        subCategory: "co-ords",
        wearType: "western",
        image: images[0],
        images: images,
        description: coordDescriptions[i - 1] || "Exquisite matching co-ord set designed to offer seamless modern styling and breathable comfort.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        rating: (4.5 + (i * 0.05) % 0.5).toFixed(1),
        reviewsCount: 20 + (i * 18) % 120
      });
    }
  }
}

// ==================== 3. WOMEN'S T-SHIRTS ====================
const tshirtsDir = path.join(__dirname, '../../public/t-shirts/t-shirt');
const tshirtTitles = [
  "Pastel Lavender Organic Cotton Crop T-Shirt", "Sage Olive Graphic Printed Oversized Tee",
  "Classic Ivory Ribbed Crewneck Slim T-Shirt", "Mustard Yellow Summer Slub Cotton Tee",
  "Navy Nautical Stripe Sailor Fit T-Shirt", "Rose Pink Embroidered Pocket Casual Tee",
  "Midnight Black Drop Shoulder Boyfriend T-Shirt", "Burgundy V-Neck Premium Supima T-Shirt",
  "Emerald Green Mockneck Ribbed T-Shirt", "Mint Lime Floral Motif Lightweight Tee"
];
const tshirtDescriptions = [
  "Crafted in ultra-soft organic lavender cotton, this crop t-shirt offers a flattering relaxed crewneck style and breathable ribbed sleeve cuffs.",
  "Make a minimal eco-statement in this oversized sage olive graphic tee, featuring unique screen-printed modern botanical motifs.",
  "A wardrobe essential. Our ivory white ribbed crewneck is knit with premium long-staple cotton, offering an incredibly smooth body contour.",
  "Sunny and cheerful slub cotton tee in gorgeous mustard yellow, detailed with rolled cuffs and a relaxed boyfriend scoop neckline.",
  "Sail away in our marine navy nautical striped sailor t-shirt, tailored in premium heavyweight cotton jersey with classic side slits.",
  "Charming rose pink t-shirt in breathable organic jersey, featuring a functional chest pocket with delicate floral custom embroidery.",
  "Super-relaxed midnight black boyfriend tee with deep drop-shoulder seams and an ultra-soft peach skin fabric finish.",
  "Luxe daily wear. This burgundy v-neck tee is crafted in 100% genuine USA-grown Supima cotton, providing unmatched silkiness.",
  "Dress up your denim with our emerald green mockneck t-shirt, knitted in an elegant fine rib pattern with chic elbow sleeves.",
  "Refreshing mint lime summer tee, featuring a tiny embroidered center-chest floral motif in breathable cambric cotton weave."
];

if (fs.existsSync(tshirtsDir)) {
  console.log('Scanning women\'s t-shirts folder...');
  for (let i = 1; i <= 10; i++) {
    const images = scanFolderImages(tshirtsDir, i, '/t-shirts/t-shirt');
    if (images.length > 0) {
      generatedProducts.push({
        id: 2200 + i,
        title: tshirtTitles[i - 1] || `Premium Cotton Casual T-Shirt ${i}`,
        price: 799 + (i * 90) % 500,
        originalPrice: (799 + (i * 90) % 500) * 2,
        discount: "50% OFF",
        category: "women",
        subCategory: "t-shirts",
        wearType: "western",
        image: images[0],
        images: images,
        description: tshirtDescriptions[i - 1] || "Super-soft daily wear premium cotton t-shirt with custom breathable weave and relaxed tailoring.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        rating: (4.3 + (i * 0.06) % 0.7).toFixed(1),
        reviewsCount: 30 + (i * 35) % 200
      });
    }
  }
}

// ==================== 4. WOMEN'S BOTTOM WEAR ====================
const bottomsDir = path.join(__dirname, '../../public/bottoms/bottom_wear');
const bottomTitles = [
  "Ivory White Wide-Leg Linen Trousers", "Sage Olive High-Waisted Tailored Cigarette Pants",
  "Midnight Blue Flared Cotton Palazzo Pants", "Crimson Rose Silk Blend Culottes",
  "Teal Leaf Print Elasticated Summer Pants", "Burgundy Linen Tailored Ankle-Length Trousers",
  "Mustard Yellow Khadi Cotton Dhoti Salwar", "Pastel Peach Soft Crepe Relaxed Jogger Pants",
  "Classic Black Pleated Palazzo Trousers", "Linen Khaki Straight-Fit Utility Pants"
];
const bottomDescriptions = [
  "Indulge in breezy summer leisure with our ivory white wide-leg trousers, tailored in premium organic French linen with elasticated back waistbands.",
  "Look exceptionally sharp in these high-waisted cigarette pants in sage olive, featuring a structured waist hook and subtle side ankle slits.",
  "Flowy, comfortable, and wide-flared. These deep midnight blue cotton palazzo pants are crafted with subtle horizontal metallic threads.",
  "A gorgeous fusion of silk and crepe. These crimson rose cropped culottes drape beautifully, featuring convenient deep side utility pockets.",
  "Lightweight and elasticated for extreme hot weather comfort, presenting subtle hand-painted teal organic floral prints.",
  "Rich burgundy trousers crafted in pre-washed breathable linen fabric, presenting a modern cropped length and front crease lines.",
  "Traditional comfort re-defined. Mustard yellow dhoti trousers in authentic hand-spun Khadi cotton, offering absolute airflow and drape.",
  "Laid-back elegance. Pastel peach crepe joggers featuring a soft satin drawstring ribbon and comfortable cuffed ankle hems.",
  "Timeless wardrobe classic. Fully pleated black palazzos in premium breathable georgette with a smooth inner lining.",
  "Smart utility pants in textured linen khaki, styled with practical deep cargo-inspired side pockets and tailored belt loops."
];

if (fs.existsSync(bottomsDir)) {
  console.log('Scanning women\'s bottoms folder...');
  for (let i = 1; i <= 10; i++) {
    const images = scanFolderImages(bottomsDir, i, '/bottoms/bottom_wear');
    if (images.length > 0) {
      generatedProducts.push({
        id: 2300 + i,
        title: bottomTitles[i - 1] || `Premium Tailored Comfort Bottoms ${i}`,
        price: 1199 + (i * 110) % 700,
        originalPrice: (1199 + (i * 110) % 700) * 2,
        discount: "50% OFF",
        category: "women",
        subCategory: "bottoms",
        wearType: "western",
        image: images[0],
        images: images,
        description: bottomDescriptions[i - 1] || "Exquisite tailored bottoms designed with ultra-breathable fibers for maximum daily comfort.",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        rating: (4.4 + (i * 0.05) % 0.6).toFixed(1),
        reviewsCount: 18 + (i * 22) % 140
      });
    }
  }
}


// ==========================================
// MEN'S WEAR SECTIONS (10 NEW CATEGORIES)
// ==========================================

// Helper for Men's data generation
function addMensCategory(dirName, subfolderPrefix, urlPrefix, subCat, titles, basePrice, idBlock) {
  const fullDir = path.join(__dirname, `../../public/mens/${dirName}`);
  if (fs.existsSync(fullDir)) {
    console.log(`Scanning men's ${subCat} folder:`, fullDir);
    for (let i = 1; i <= 10; i++) {
      const folderKey = `${subfolderPrefix}${i}`;
      const images = scanFolderImages(fullDir, folderKey, urlPrefix);
      if (images.length > 0) {
        const itemPrice = basePrice + (i * 130) % 700;
        generatedProducts.push({
          id: idBlock + i,
          title: titles[i - 1] || `Men's Luxury Classic ${subCat} Ed. ${i}`,
          price: itemPrice,
          originalPrice: itemPrice * 2,
          discount: "50% OFF",
          category: "men",
          subCategory: subCat,
          wearType: subCat.toLowerCase().includes('kurta') ? "ethnic" : "western",
          image: images[0],
          images: images,
          description: `Superbly crafted premium Men's ${subCat}. Designed in high-grade ultra-breathable fabric for unmatched tailored fit, seamless daily style, and maximum wearing convenience.`,
          sizes: ["S", "M", "L", "XL", "XXL"],
          rating: (4.3 + (i * 0.06) % 0.6).toFixed(1),
          reviewsCount: 25 + (i * 20) % 150
        });
      }
    }
  }
}

// 1. Men's Track Pants
const trackpantsTitles = [
  "Midnight Black Premium Athletic Trackpants", "Slate Grey Quick-Dry Sports Jogger",
  "Navy Blue Breathable Performance Trackpants", "Olive Green Cargo Utility Jogger Pants",
  "Charcoal Melange Soft Lounge Trackpants", "Camouflage Printed Active Gym Pants",
  "Desert Sand Lightweight Cargo Trackpants", "Royal Blue Stripped Performance Joggers",
  "Forest Green Organic Cotton Trackpants", "Classic Heather Grey Sports Joggers"
];
addMensCategory('trackpants/TRackpents', 'T', '/mens/trackpants/TRackpents', 'trackpants', trackpantsTitles, 999, 3000);

// 2. Men's Jackets
const jacketsTitles = [
  "Raw Tan Premium Biker Leather Jacket", "Rugged Indigo Stonewashed Denim Jacket",
  "Olive Drab Heavyweight Field Utility Jacket", "Midnight Black Urban Puffer Jacket",
  "Classic Navy Premium Varsity Bomber Jacket", "Suede Camel Luxury Trucker Jacket",
  "Charcoal Windproof Performance Hooded Jacket", "Burgundy Satin Flight Bomber Jacket",
  "Khaki Canvas Winter Sherpa-Lined Jacket", "Slate Grey Waterproof Outdoor Raincoat"
];
addMensCategory('jackets/jacketmen', 'j', '/mens/jackets/jacketmen', 'jackets', jacketsTitles, 2299, 3100);

// 3. Men's Hoodies
const hoodiesTitles = [
  "Carbon Black Premium Heavyweight Hoodie", "Burgundy Crimson Fleece Lounge Pullover",
  "Classic Navy Relaxed Kangaroo Pocket Hoodie", "Sage Olive Organic French Terry Hoodie",
  "Heather Grey Premium Ribbed Fleece Pullover", "Mustard Yellow Cozy Fleece Winter Hoodie",
  "Dusty Rose Pastel Cotton Terry Hoodie", "Teal Blue Performance Zip-Up Hoodie",
  "Off-White Luxury Soft Cotton Hoodie", "Forest Green Winter Thermal Fleece Pullover"
];
addMensCategory('hoodies/Hoodiesmen', 'h', '/mens/hoodies/Hoodiesmen', 'hoodies', hoodiesTitles, 1399, 3200);

// 4. Men's Blazers
const blazersTitles = [
  "Midnight Navy Structured Slim-Fit Blazer", "Textured Charcoal Linen Smart Casual Blazer",
  "Classic Black Royal Velvet Evening Blazer", "Tan Tweed Wool-Blend Ceremonial Blazer",
  "Olive Green Double-Breasted Notch Blazer", "Emerald Velvet Royal Bandhgala Blazer",
  "Light Grey Summer Cotton Unstructured Blazer", "Burgundy Wine Premium Wedding Blazer",
  "Champagne Gold Textured Silk Nehru Blazer", "Royal Blue Satin-Lapel Evening Tuxedo Jacket"
];
addMensCategory('blazers/Blezermen', 'b', '/mens/blazers/Blezermen', 'blazers', blazersTitles, 3499, 3300);

// 5. Men's Co-ord Sets
const mensCoordsTitles = [
  "Sage Green Linen Shirt & Trouser Set", "Midnight Navy Resort Waffle Knit Co-ord",
  "Pastel Peach Summer Camp-Collar Shorts Set", "Khaki Utility Pocket Cotton Co-ord Set",
  "Monochrome Stripe Relaxed Lounge Co-ord", "Indigo Shibori Printed Resort Shirt & Shorts",
  "Crimson Rose Silk Blend Lounge Kaftan Set", "Emerald Green Dobby Textured Tunic & Pant Set",
  "Desert Sand Organic Cotton Summer Co-ord", "Burgundy Wine Waffle Hooded Joggers Set"
];
addMensCategory('coords/co-ordset men', 'co', '/mens/coords/co-ordset men', 'gents co-ords', mensCoordsTitles, 1899, 3400);

// 6. Men's Shirts
const shirtsTitles = [
  "Classic Pure White Cotton Oxford Shirt", "Sage Green Relaxed Summer Linen Shirt",
  "Indigo Blue Dobby Micro-Print Shirt", "Mustard Yellow Mandarain Collar Cotton Shirt",
  "Nautical Navy Stripe Semi-Formal Shirt", "Burgundy Crimson Luxury Satin Party Shirt",
  "Olive Drab Double-Pocket Cargo Utility Shirt", "Pastel Rose Pink Premium Cotton Gingham Shirt",
  "Carbon Black Premium Satin Evening Dress Shirt", "Sky Blue Chambray Tailored Casual Shirt"
];
addMensCategory('shirts/shirt', 'shirt ', '/mens/shirts/shirt', 'shirts', shirtsTitles, 1199, 3500);

// 7. Men's T-Shirts
const mensTshirtsTitles = [
  "Classic Black Organic Long-Staple Crewneck", "Ivory White Premium Ribbed Muscle Tee",
  "Navy Blue Classic Pique Polo T-Shirt", "Mustard Yellow Casual Summer Pocket Tee",
  "Sage Olive Oversized Drop-Shoulder T-Shirt", "Heather Grey Athletics V-Neck Tee",
  "Pastel Rose Soft Cotton Slub T-Shirt", "Burgundy Wine Premium Supima Tee",
  "Nautical Stripe Classic Sailor Polo Shirt", "Forest Green Minimal Chest Embroidered Tee"
];
addMensCategory('tshirts/t-shirt', '', '/mens/tshirts/t-shirt', 'gents t-shirts', mensTshirtsTitles, 699, 3600);

// 8. Men's Pants
const pantsTitles = [
  "Structured Tan Tailored Cigarette Chinos", "Classic Navy Straight-Fit Cotton Trousers",
  "Slate Grey Pleated Smart Office Pants", "Olive Green Utility Cargo Cotton Trousers",
  "Off-White Breathable French Linen Trousers", "Burgundy Wine Tailored Slim Trousers",
  "Khaki Canvas Straight-Fit Casual Chinos", "Charcoal Grey Ankle-Length Smart Pants",
  "Sage Green Elasticated Summer Jogger Pants", "Classic Black Tailored Formal Trousers"
];
addMensCategory('pants/Pants', '', '/mens/pants/Pants', 'pants', pantsTitles, 1299, 3700);

// 9. Men's Jeans
const jeansTitles = [
  "Classic Midnight Blue Deep Indigo Jeans", "Raw Indigo Stonewashed Baggy Jeans",
  "Slate Grey Distress Tapered Fit Jeans", "Carbon Black Vintage Whisker Denim Jeans",
  "Ice Grey Premium Loose-Fit Denim Jeans", "Sage Olive Cargo Pocket Denim Utility Jeans",
  "Light Wash Aqua Blue Summer Relaxed Jeans", "Desert Brown Loose Baggy Streetwear Jeans",
  "Classic Charcoal Black Slim Straight Jeans", "Deep Cobalt Worn-In Textured Denim Jeans"
];
addMensCategory('jeans/jeans', '', '/mens/jeans/jeans', 'jeans', jeansTitles, 1599, 3800);

// 10. Men's Kurtas (gents kurtas)
const mensKurtasTitles = [
  "Majestic Emerald Green Hand-Embroidered Kurta", "Classic Royal Purple Traditional Cotton Kurta",
  "Pastel Sage Olive Hand-Block Printed Kurta", "Indigo Blue Authentic Khadi Weave Kurta",
  "Sunset Mustard Linen Festive Bandhgala Kurta", "Ivory White Premium Silk Ceremonial Kurta",
  "Midnight Black Cotton Threadwork Pathani Kurta", "Ruby Crimson Handcrafted Silk Blend Kurta",
  "Lemon Yellow Micro-Dobby Casual Kurta", "Mint Green Soft Cotton Summer Tunic Kurta"
];
addMensCategory('kurtas/kurta', '', '/mens/kurtas/kurta', 'gents kurtas', mensKurtasTitles, 1199, 3900);


// 3. Merge and write
const merged = [...baseProducts, ...generatedProducts];
console.log('Total merged products count:', merged.length);

const outputContent = 'export const products = ' + JSON.stringify(merged, null, 2) + ';\n';
fs.writeFileSync(productsPath, outputContent, 'utf8');
console.log('rebuild_all_products.cjs COMPLETED SUCCESSFULLY!');

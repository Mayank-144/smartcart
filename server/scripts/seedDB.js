import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { generateEmbedding } from '../utils/embeddings.js';

// Configure reliable DNS servers to ensure Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // fallback to system default if restricted
}

// Resolve environment variables from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawProducts = [
  // DAIRY (15 products)
  {
    name: 'Whole Milk',
    category: 'dairy',
    price: 4.49,
    description: 'Creamy, farm-fresh pasteurized organic whole milk rich in vitamin D and calcium.',
  },
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    price: 5.29,
    description: 'Thick, creamy, non-fat strained Greek yogurt packed with high protein and live active cultures.',
  },
  {
    name: 'Cheddar Cheese',
    category: 'dairy',
    price: 6.99,
    description: 'Rich, bold, and crumbly sharp white cheddar aged over 12 months for deep flavor.',
  },
  {
    name: 'Butter',
    category: 'dairy',
    price: 4.89,
    description: 'Traditional Grade-A butter churned from pure cream with a pinch of sea salt.',
  },
  {
    name: 'Cottage Cheese',
    category: 'dairy',
    price: 3.79,
    description: 'Fresh curd cottage cheese with 2% milkfat, excellent for quick snacks and salads.',
  },
  {
    name: 'Fresh Mozzarella',
    category: 'dairy',
    price: 5.49,
    description: 'Soft, delicate fresh mozzarella crafted in pure whey brine, ideal for Caprese salads.',
  },
  {
    name: 'Whipping Cream',
    category: 'dairy',
    price: 3.99,
    description: 'Ultra-pasteurized heavy cream with 36% milkfat, whips into fluffy peaks for desserts.',
  },
  {
    name: 'Sour Cream',
    category: 'dairy',
    price: 2.69,
    description: 'Tangy and velvety cultured sour cream, perfect for tacos, dips, and baked potatoes.',
  },
  {
    name: 'Almond Milk',
    category: 'dairy',
    price: 3.59,
    description: 'Smooth, plant-based dairy-free milk alternative with a subtle nutty taste and only 30 calories.',
  },
  {
    name: 'Oat Milk',
    category: 'dairy',
    price: 4.79,
    description: 'Creamy vegan oat milk specially formulated to steam and froth beautifully into lattes.',
  },
  {
    name: 'Parmesan Cheese',
    category: 'dairy',
    price: 5.99,
    description: 'Finely aged Italian hard cheese with savory umami flavor to dust over pasta and soups.',
  },
  {
    name: 'Feta Cheese',
    category: 'dairy',
    price: 4.99,
    description: 'Tangy, crumbly authentic sheep and goat milk feta preserved in natural brine.',
  },
  {
    name: 'Ricotta Cheese',
    category: 'dairy',
    price: 4.19,
    description: 'Fluffy, mildly sweet Italian curd cheese essential for lasagna, cannoli, and stuffed shells.',
  },
  {
    name: 'Cream Cheese',
    category: 'dairy',
    price: 3.29,
    description: 'Rich and smooth spreadable cream cheese, ideal for toasted morning bagels.',
  },
  {
    name: 'Strawberry Kefir',
    category: 'dairy',
    price: 4.59,
    description: 'Tart, effervescent drinkable fermented yogurt beverage loaded with 12 probiotic strains.',
  },

  // SNACKS (15 products)
  {
    name: 'Potato Chips',
    category: 'snacks',
    price: 3.99,
    description: 'Extra crunchy batch-cooked kettle chips seasoned with pure Pacific sea salt.',
  },
  {
    name: 'Roasted Almonds',
    category: 'snacks',
    price: 7.49,
    description: 'Crunchy California almonds dry-roasted with natural hickory smoke seasoning.',
  },
  {
    name: 'Tortilla Chips',
    category: 'snacks',
    price: 3.49,
    description: 'Crispy stone-ground restaurant style corn tortilla chips, made for chunky salsa and guacamole.',
  },
  {
    name: 'Dark Chocolate',
    category: 'snacks',
    price: 3.89,
    description: 'Single-origin fair trade bittersweet cacao bar with hints of blackberry and roasted coffee.',
  },
  {
    name: 'Butter Popcorn',
    category: 'snacks',
    price: 4.19,
    description: 'Fluffy whole-grain popped corn infused with warm golden movie theater butter flavor.',
  },
  {
    name: 'Pretzel Crisps',
    category: 'snacks',
    price: 3.79,
    description: 'Flat, crunchy pretzel snacks offering all the pretzel goodness with a chip-like crunch.',
  },
  {
    name: 'Trail Mix',
    category: 'snacks',
    price: 8.99,
    description: 'Nutritious wholesome blend of walnuts, dried cranberries, pumpkin seeds, and dark raisins.',
  },
  {
    name: 'Rice Cakes',
    category: 'snacks',
    price: 2.99,
    description: 'Light and airy puffed whole-grain brown rice disks kissed with sweet buttery caramel.',
  },
  {
    name: 'Beef Jerky',
    category: 'snacks',
    price: 6.99,
    description: 'Tender strips of premium lean beef marinated in sweet soy sauce, ginger, and garlic.',
  },
  {
    name: 'Pita Chips',
    category: 'snacks',
    price: 4.29,
    description: 'Twice-baked seasoned Mediterranean pita chips with roasted garlic and real parmesan.',
  },
  {
    name: 'Granola Bars',
    category: 'snacks',
    price: 3.69,
    description: 'Chewy rolled oat bars sweetened with wild clover honey and golden crisp rice.',
  },
  {
    name: 'Cheese Crackers',
    category: 'snacks',
    price: 3.49,
    description: 'Bite-sized crispy snack crackers baked with 100% real cheddar cheese.',
  },
  {
    name: 'Gummy Bears',
    category: 'snacks',
    price: 2.79,
    description: 'Soft and chewy candy gummies dusted with mouth-puckering sour crystalline sugar.',
  },
  {
    name: 'Salted Pistachios',
    category: 'snacks',
    price: 8.49,
    description: 'Sun-ripened in-shell California pistachios roasted with delicate sea salt crystals.',
  },
  {
    name: 'Dried Mango',
    category: 'snacks',
    price: 5.99,
    description: 'Naturally sweet and tangy dried tropical Philippine mango slices with no added sugar.',
  },

  // BEVERAGES (15 products)
  {
    name: 'Cold Brew Coffee',
    category: 'beverages',
    price: 4.29,
    description: 'Silky smooth nitrogen-infused black cold brew with a creamy cascading foam head.',
  },
  {
    name: 'Sparkling Water',
    category: 'beverages',
    price: 5.49,
    description: 'Zero calorie crisp carbonated mineral water naturally infused with citrus essence.',
  },
  {
    name: 'Orange Juice',
    category: 'beverages',
    price: 4.99,
    description: 'Pure squeezed sweet Florida orange juice with rich pulp, loaded with Vitamin C.',
  },
  {
    name: 'Green Tea',
    category: 'beverages',
    price: 4.79,
    description: 'Earthy, refreshing steamed green tea leaves with soothing antioxidants and clean finish.',
  },
  {
    name: 'Lemon Kombucha',
    category: 'beverages',
    price: 3.99,
    description: 'Naturally effervescent fermented black tea brewed with spicy ginger and tangy lemon.',
  },
  {
    name: 'Coconut Water',
    category: 'beverages',
    price: 3.49,
    description: 'Electrolyte-rich natural water harvested from young green coconuts for instant hydration.',
  },
  {
    name: 'Earl Grey Tea',
    category: 'beverages',
    price: 4.49,
    description: 'Classic bold black tea blend scented with aromatic essential oil of Mediterranean bergamot.',
  },
  {
    name: 'Cranberry Juice',
    category: 'beverages',
    price: 4.89,
    description: 'Unsweetened tart cranberry juice made from real bog cranberries with robust antioxidant power.',
  },
  {
    name: 'Lemonade',
    category: 'beverages',
    price: 3.79,
    description: 'Sweet and tangy old-fashioned lemonade made from fresh squeezed Meyer lemons and cane sugar.',
  },
  {
    name: 'Craft Cola',
    category: 'beverages',
    price: 2.49,
    description: 'Spiced vintage cola soda crafted with genuine kola nuts, cinnamon, vanilla, and pure cane sugar.',
  },
  {
    name: 'Apple Cider',
    category: 'beverages',
    price: 4.99,
    description: 'Unfiltered autumn pressed apple juice spiced with fragrant cinnamon, cloves, and allspice.',
  },
  {
    name: 'Chamomile Tea',
    category: 'beverages',
    price: 4.19,
    description: 'Caffeine-free herbal infusion made from whole dried Egyptian chamomile flower heads.',
  },
  {
    name: 'Energy Drink',
    category: 'beverages',
    price: 2.99,
    description: 'Invigorating zero-sugar energy boost with natural caffeine from green tea and B-vitamins.',
  },
  {
    name: 'Tomato Juice',
    category: 'beverages',
    price: 3.69,
    description: 'Thick, savory blend of ripe red vine tomatoes, celery, carrots, and garden spices.',
  },
  {
    name: 'Matcha Latte',
    category: 'beverages',
    price: 7.99,
    description: 'Japanese ceremonial grade stone-ground matcha powder lightly blended with organic sugar.',
  },

  // BAKERY (15 products)
  {
    name: 'Sourdough Bread',
    category: 'bakery',
    price: 5.49,
    description: 'Artisanal round loaf with a crunchy blistering crust and pleasantly tangy, open crumb.',
  },
  {
    name: 'Butter Croissant',
    category: 'bakery',
    price: 2.99,
    description: 'Flaky, buttery, golden multi-layered pastry baked with authentic European churned butter.',
  },
  {
    name: 'Wheat Bread',
    category: 'bakery',
    price: 3.99,
    description: 'Soft sliced loaf made with stone-ground whole wheat flour, honey, and dietary fiber.',
  },
  {
    name: 'Blueberry Muffin',
    category: 'bakery',
    price: 2.79,
    description: 'Moist golden bakery muffin overflowing with sweet Maine wild blueberries and sugar crumble.',
  },
  {
    name: 'Cinnamon Bagels',
    category: 'bakery',
    price: 4.49,
    description: 'Boiled and hearth-baked chewy bagels packed with plump raisins and aromatic Korintje cinnamon.',
  },
  {
    name: 'French Baguette',
    category: 'bakery',
    price: 2.89,
    description: 'Classic slender French loaf with a crisp golden crust, tender interior, and airy crumb.',
  },
  {
    name: 'Chocolate Cookies',
    category: 'bakery',
    price: 4.99,
    description: 'Warm bakery style cookies loaded with melted semi-sweet chocolate morsels and creamy butter.',
  },
  {
    name: 'Brioche Buns',
    category: 'bakery',
    price: 4.29,
    description: 'Tender, sweet French-style brioche rolls enriched with eggs and butter for gourmet sandwiches.',
  },
  {
    name: 'Pita Bread',
    category: 'bakery',
    price: 3.49,
    description: 'Soft pocket pita flatbreads baked with flaxseed, barley, oats, and whole grains.',
  },
  {
    name: 'Banana Bread',
    category: 'bakery',
    price: 5.99,
    description: 'Rich, dense sweet quick bread baked with ripe mashed bananas and crunchy toasted walnuts.',
  },
  {
    name: 'Glazed Donuts',
    category: 'bakery',
    price: 4.69,
    description: 'Cake donut rings with crisp craggy edges dipped in warm sweet vanilla sugar glaze.',
  },
  {
    name: 'Ciabatta Rolls',
    category: 'bakery',
    price: 3.99,
    description: 'Rustic Italian rolls with an olive-oil brushed crust, cavernous crumb, and soft chew.',
  },
  {
    name: 'Apple Turnover',
    category: 'bakery',
    price: 3.19,
    description: 'Crisp puff pastry triangle filled with warm cinnamon-spiced caramelized apples.',
  },
  {
    name: 'English Muffins',
    category: 'bakery',
    price: 3.79,
    description: 'Griddle-baked breakfast muffins bursting with nooks and crannies to catch melted butter.',
  },
  {
    name: 'Cornbread',
    category: 'bakery',
    price: 4.49,
    description: 'Moist, golden yellow cornbread loaf with subtle sweetness and coarse cornmeal crumb.',
  },

  // FRUITS (15 products)
  {
    name: 'Honeycrisp Apples',
    category: 'fruits',
    price: 4.99,
    description: 'Crisp, juicy premium orchard apples with a balanced sweet and tart crunch.',
  },
  {
    name: 'Bananas',
    category: 'fruits',
    price: 1.89,
    description: 'Sweet, creamy organic yellow bananas rich in potassium and quick natural energy.',
  },
  {
    name: 'Strawberries',
    category: 'fruits',
    price: 4.49,
    description: 'Plump, fragrant bright red strawberries harvested at peak ripeness for dessert or snacks.',
  },
  {
    name: 'Avocados',
    category: 'fruits',
    price: 5.49,
    description: 'Creamy, nutty dark-skinned Hass avocados packed with healthy monounsaturated fats.',
  },
  {
    name: 'Watermelon',
    category: 'fruits',
    price: 5.99,
    description: 'Sweet, refreshing personal-sized watermelon with crisp crimson flesh and sweet juice.',
  },
  {
    name: 'Blueberries',
    category: 'fruits',
    price: 3.99,
    description: 'Sweet, plump indigo blue berries filled with juicy bursting flavor and antioxidants.',
  },
  {
    name: 'Lemons',
    category: 'fruits',
    price: 3.29,
    description: 'Bright, vibrant yellow lemons with fragrant citrus zest and high juice content.',
  },
  {
    name: 'Navel Oranges',
    category: 'fruits',
    price: 4.19,
    description: 'Easy-to-peel juicy seedless oranges packed with natural sweetness and vitamin C.',
  },
  {
    name: 'Peaches',
    category: 'fruits',
    price: 4.79,
    description: 'Fragrant velvety-skinned stone fruit with juicy sweet amber flesh and mild acidity.',
  },
  {
    name: 'Cherries',
    category: 'fruits',
    price: 6.99,
    description: 'Plump, firm, and deeply sweet dark cherries with rich ruby juice and crisp skin.',
  },
  {
    name: 'Red Grapes',
    category: 'fruits',
    price: 4.69,
    description: 'Crisp and sweet seedless red grape clusters, great for snacking and cheese boards.',
  },
  {
    name: 'Pineapple',
    category: 'fruits',
    price: 3.99,
    description: 'Tropical golden ripe pineapple with extraordinarily juicy, fragrant, sweet yellow flesh.',
  },
  {
    name: 'Mangoes',
    category: 'fruits',
    price: 4.29,
    description: 'Silky smooth golden mangoes with non-fibrous creamy flesh and intense sweet perfume.',
  },
  {
    name: 'Kiwifruit',
    category: 'fruits',
    price: 3.49,
    description: 'Fuzzy-skinned fruit with bright emerald green interior, edible black seeds, and tangy flavor.',
  },
  {
    name: 'Blackberries',
    category: 'fruits',
    price: 3.99,
    description: 'Deep purple succulent berries offering a perfect contrast of rich sweetness and earthy tartness.',
  },

  // VEGETABLES (15 products)
  {
    name: 'Baby Spinach',
    category: 'vegetables',
    price: 3.49,
    description: 'Tender, pre-washed baby spinach leaves rich in iron, perfect for fresh salads and smoothies.',
  },
  {
    name: 'Broccoli',
    category: 'vegetables',
    price: 2.99,
    description: 'Crisp green florets packed with fiber, vitamins, and nutrients, great for steaming and roasting.',
  },
  {
    name: 'Roma Tomatoes',
    category: 'vegetables',
    price: 2.79,
    description: 'Dense, meaty plum tomatoes with few seeds, the premier choice for sauces and salsas.',
  },
  {
    name: 'Bell Peppers',
    category: 'vegetables',
    price: 4.99,
    description: 'Vibrant pack of red, yellow, and orange sweet bell peppers with a juicy, crunchy bite.',
  },
  {
    name: 'Baking Potatoes',
    category: 'vegetables',
    price: 4.29,
    description: 'Classic starchy potatoes with earthy brown skins, fluffy when baked and crispy when fried.',
  },
  {
    name: 'Carrots',
    category: 'vegetables',
    price: 2.29,
    description: 'Sweet and crunchy garden carrots loaded with beta-carotene, great raw or glazed.',
  },
  {
    name: 'Red Onions',
    category: 'vegetables',
    price: 2.49,
    description: 'Pungent, sweet purple-red layered onions providing crisp color to salads and burgers.',
  },
  {
    name: 'Garlic',
    category: 'vegetables',
    price: 1.99,
    description: 'Aromatic plump garlic cloves that form the savory flavor foundation for global cuisine.',
  },
  {
    name: 'Cucumbers',
    category: 'vegetables',
    price: 2.19,
    description: 'Thin-skinned sweet cucumber with refreshing crunch and zero bitterness, wrapped for freshness.',
  },
  {
    name: 'Zucchini',
    category: 'vegetables',
    price: 2.49,
    description: 'Tender summer squash with mild flavor and thin edible skin, ideal for grilling and sautéing.',
  },
  {
    name: 'Romaine Lettuce',
    category: 'vegetables',
    price: 3.99,
    description: 'Crunchy, sweet inner romaine leaves with sturdy ribs, the classic base for Caesar salads.',
  },
  {
    name: 'Cauliflower',
    category: 'vegetables',
    price: 3.69,
    description: 'Dense, creamy-white curds that roast to nutty perfection or blend into low-carb mash.',
  },
  {
    name: 'Green Asparagus',
    category: 'vegetables',
    price: 4.99,
    description: 'Fresh young asparagus stalks with delicate tips, delicious roasted with olive oil and lemon.',
  },
  {
    name: 'Bella Mushrooms',
    category: 'vegetables',
    price: 3.29,
    description: 'Earthy crimini mushrooms with rich savory depth and firm texture for stir-fries and pasta.',
  },
  {
    name: 'Sweet Corn',
    category: 'vegetables',
    price: 3.79,
    description: 'Tender, juicy golden kernels bursting with farm-fresh summertime sweetness when grilled or boiled.',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');

    console.log(`Starting to process ${rawProducts.length} products with short names...`);

    // Clear existing products collection
    const deleted = await Product.deleteMany({});
    console.log(`Cleared existing collection (${deleted.deletedCount} items removed).`);

    const productsToInsert = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const p = rawProducts[i];
      // Embed string: "{name} {category} {description}"
      const embedInput = `${p.name} ${p.category} ${p.description}`;
      const embedding = await generateEmbedding(embedInput);

      productsToInsert.push({
        ...p,
        embedding,
      });

      if ((i + 1) % 15 === 0 || i === rawProducts.length - 1) {
        console.log(`Embedded ${i + 1}/${rawProducts.length} products...`);
      }
    }

    console.log('Inserting all products with vector embeddings into MongoDB...');
    const inserted = await Product.insertMany(productsToInsert);
    console.log(`Successfully re-seeded ${inserted.length} products with short names!`);

    await mongoose.disconnect();
    console.log('Database disconnected. Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();

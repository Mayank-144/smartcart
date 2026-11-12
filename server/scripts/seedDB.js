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

const productImages = {
  'Whole Milk': 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&w=400',
  'Greek Yogurt': 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?auto=compress&w=400',
  'Cheddar Cheese': 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&w=400',
  Butter: 'https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg?auto=compress&w=400',
  'Cottage Cheese': 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&w=400',
  'Fresh Mozzarella': 'https://images.pexels.com/photos/2531189/pexels-photo-2531189.jpeg?auto=compress&w=400',
  'Whipping Cream': 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&w=400',
  'Sour Cream': 'https://images.pexels.com/photos/4871116/pexels-photo-4871116.jpeg?auto=compress&w=400',
  'Almond Milk': 'https://images.pexels.com/photos/4958153/pexels-photo-4958153.jpeg?auto=compress&w=400',
  'Oat Milk': 'https://images.pexels.com/photos/5946971/pexels-photo-5946971.jpeg?auto=compress&w=400',
  'Parmesan Cheese': 'https://images.pexels.com/photos/4894795/pexels-photo-4894795.jpeg?auto=compress&w=400',
  'Feta Cheese': 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&w=400',
  'Ricotta Cheese': 'https://images.pexels.com/photos/6287525/pexels-photo-6287525.jpeg?auto=compress&w=400',
  'Cream Cheese': 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg?auto=compress&w=400',
  'Strawberry Kefir': 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&w=400',
  'Potato Chips': 'https://images.pexels.com/photos/568805/pexels-photo-568805.jpeg?auto=compress&w=400',
  'Roasted Almonds': 'https://images.pexels.com/photos/1013420/pexels-photo-1013420.jpeg?auto=compress&w=400',
  'Tortilla Chips': 'https://images.pexels.com/photos/5175537/pexels-photo-5175537.jpeg?auto=compress&w=400',
  'Dark Chocolate': 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&w=400',
  'Butter Popcorn': 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&w=400',
  'Pretzel Crisps': 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&w=400',
  'Trail Mix': 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&w=400',
  'Rice Cakes': 'https://images.pexels.com/photos/8107831/pexels-photo-8107831.jpeg?auto=compress&w=400',
  'Beef Jerky': 'https://images.pexels.com/photos/8697536/pexels-photo-8697536.jpeg?auto=compress&w=400',
  'Pita Chips': 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&w=400',
  'Granola Bars': 'https://images.pexels.com/photos/8107832/pexels-photo-8107832.jpeg?auto=compress&w=400',
  'Cheese Crackers': 'https://images.pexels.com/photos/4474052/pexels-photo-4474052.jpeg?auto=compress&w=400',
  'Gummy Bears': 'https://images.pexels.com/photos/33786469/pexels-photo-33786469.jpeg?auto=compress&w=400',
  'Salted Pistachios': 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&w=400',
  'Dried Mango': 'https://images.pexels.com/photos/5945560/pexels-photo-5945560.jpeg?auto=compress&w=400',
  'Cold Brew Coffee': 'https://images.pexels.com/photos/2638019/pexels-photo-2638019.jpeg?auto=compress&w=400',
  'Sparkling Water': 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&w=400',
  'Orange Juice': 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&w=400',
  'Green Tea': 'https://images.pexels.com/photos/33526960/pexels-photo-33526960.jpeg?auto=compress&w=400',
  'Lemon Kombucha': 'https://images.pexels.com/photos/5947019/pexels-photo-5947019.jpeg?auto=compress&w=400',
  'Coconut Water': 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&w=400',
  'Earl Grey Tea': 'https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg?auto=compress&w=400',
  'Cranberry Juice': 'https://images.pexels.com/photos/5946965/pexels-photo-5946965.jpeg?auto=compress&w=400',
  Lemonade: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&w=400',
  'Craft Cola': 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&w=400',
  'Apple Cider': 'https://images.pexels.com/photos/5946625/pexels-photo-5946625.jpeg?auto=compress&w=400',
  'Chamomile Tea': 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&w=400',
  'Energy Drink': 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&w=400',
  'Tomato Juice': 'https://images.pexels.com/photos/8796312/pexels-photo-8796312.jpeg?auto=compress&w=400',
  'Matcha Latte': 'https://images.pexels.com/photos/3879495/pexels-photo-3879495.jpeg?auto=compress&w=400',
  'Sourdough Bread': 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&w=400',
  'Butter Croissant': 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&w=400',
  'Wheat Bread': 'https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg?auto=compress&w=400',
  'Blueberry Muffin': 'https://images.pexels.com/photos/1657343/pexels-photo-1657343.jpeg?auto=compress&w=400',
  'Cinnamon Bagels': 'https://images.pexels.com/photos/1359330/pexels-photo-1359330.jpeg?auto=compress&w=400',
  'French Baguette': 'https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&w=400',
  'Chocolate Cookies': 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&w=400',
  'Brioche Buns': 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&w=400',
  'Pita Bread': 'https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&w=400',
  'Banana Bread': 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg?auto=compress&w=400',
  'Glazed Donuts': 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&w=400',
  'Ciabatta Rolls': 'https://images.pexels.com/photos/19121472/pexels-photo-19121472.jpeg?auto=compress&w=400',
  'Apple Turnover': 'https://images.pexels.com/photos/6163263/pexels-photo-6163263.jpeg?auto=compress&w=400',
  'English Muffins': 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&w=400',
  Cornbread: 'https://images.pexels.com/photos/30974633/pexels-photo-30974633.jpeg?auto=compress&w=400',
  'Honeycrisp Apples': 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&w=400',
  Bananas: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&w=400',
  Strawberries: 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&w=400',
  Avocados: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&w=400',
  Watermelon: 'https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&w=400',
  Blueberries: 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&w=400',
  Lemons: 'https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&w=400',
  'Navel Oranges': 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&w=400',
  Peaches: 'https://images.pexels.com/photos/9265739/pexels-photo-9265739.jpeg?auto=compress&w=400',
  Cherries: 'https://images.pexels.com/photos/38073147/pexels-photo-38073147.jpeg?auto=compress&w=400',
  'Red Grapes': 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&w=400',
  Pineapple: 'https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?auto=compress&w=400',
  Mangoes: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&w=400',
  Kiwifruit: 'https://images.pexels.com/photos/51312/kiwi-fruit-vitamins-healthy-eating-51312.jpeg?auto=compress&w=400',
  Blackberries: 'https://images.pexels.com/photos/892808/pexels-photo-892808.jpeg?auto=compress&w=400',
  'Baby Spinach': 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&w=400',
  Broccoli: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&w=400',
  'Roma Tomatoes': 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&w=400',
  'Bell Peppers': 'https://images.pexels.com/photos/128536/pexels-photo-128536.jpeg?auto=compress&w=400',
  'Baking Potatoes': 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&w=400',
  Carrots: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&w=400',
  'Red Onions': 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&w=400',
  Garlic: 'https://images.pexels.com/photos/6576763/pexels-photo-6576763.jpeg?auto=compress&w=400',
  Cucumbers: 'https://images.pexels.com/photos/37528/cucumber-salad-food-healthy-37528.jpeg?auto=compress&w=400',
  Zucchini: 'https://images.pexels.com/photos/128420/pexels-photo-128420.jpeg?auto=compress&w=400',
  'Romaine Lettuce': 'https://images.pexels.com/photos/1199562/pexels-photo-1199562.jpeg?auto=compress&w=400',
  Cauliflower: 'https://images.pexels.com/photos/1374651/pexels-photo-1374651.jpeg?auto=compress&w=400',
  'Green Asparagus': 'https://images.pexels.com/photos/545028/pexels-photo-545028.jpeg?auto=compress&w=400',
  'Bella Mushrooms': 'https://images.pexels.com/photos/9740583/pexels-photo-9740583.jpeg?auto=compress&w=400',
  'Sweet Corn': 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&w=400',
};

const missingProductImages = rawProducts.filter(({ name }) => !productImages[name]);
if (missingProductImages.length > 0) {
  throw new Error(
    `Missing product images for: ${missingProductImages.map(({ name }) => name).join(', ')}`
  );
}

if (new Set(Object.values(productImages)).size !== Object.keys(productImages).length) {
  throw new Error('Each product must have a unique image URL');
}

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
        image: productImages[p.name],
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

import { MenuItem } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ⭐ SECTION 4: COMBO OFFER (HERO)
  {
    id: 'five-in-one-meal-box',
    name: 'Five in One Meal Box',
    price: 270,
    category: 'Combo Deals',
    description: 'Chicken Lollipop (2 Pcs) + Chicken Nuggets (4 Pcs) + Chicken Burger + Chicken Twister + Fries',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },

  // 🧀 SECTION 1: CHEESE ITEMS
  {
    id: 'chicken-cheese-pizza',
    name: 'Chicken Cheese Pizza',
    price: 149,
    category: 'Pizza',
    description: 'Superb crispy baked flatbread crust topped with tandoori grilled chicken chunks, capsicum, sliced onions, and heavy loaded gooey melted cheese.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-cheese-twister',
    name: 'Chicken Cheese Twister',
    price: 100,
    category: 'Burgers & Twisters',
    description: 'Crispy golden chicken strips wrapped inside a soft warm tortilla with shredded lettuce, onion slices, and extra rich melted cheese.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-cheese-burger',
    name: 'Chicken Cheese Burger',
    price: 80,
    category: 'Burgers & Twisters',
    description: 'Street styled chicken patty layered with melted cheese, lettuce crunch, tandoori sauces in warm burger buns.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-cheese-sandwich',
    name: 'Chicken Cheese Sandwich',
    price: 80,
    category: 'Sandwiches & Samoli',
    description: 'Tasty street grilled white sandwich loaded with spiced shredded tandoori chicken, chopped capsicum, and a melted slice of cheese.',
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-cheese-samoli',
    name: 'Chicken Cheese Samoli',
    price: 90,
    category: 'Sandwiches & Samoli',
    description: 'Toasted local long soft Samoli (submarine) roll packed with chicken and loaded with gooey cheese slices.',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },

  // 🍗 SECTION 2: NORMAL / CLASSIC ITEMS
  {
    id: 'chicken-pizza',
    name: 'Chicken Pizza',
    price: 119,
    category: 'Pizza',
    description: 'Crispy baked crust topped with local spiced grilled chicken cubes, capsicum and traditional sauces.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'chicken-twister',
    name: 'Chicken Twister',
    price: 80,
    category: 'Burgers & Twisters',
    description: 'Crispy golden chicken strips wrapped inside a warm soft tortilla with shredded lettuce, onion slices, and signature tandoori dip.',
    image: 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-burger',
    name: 'Chicken Burger',
    price: 60,
    category: 'Burgers & Twisters',
    description: 'Flame-grilled chicken patty topped with fresh cabbage shred crunch, tandoori mayonnaise, and warm toasted sesame seeds bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-sandwich',
    name: 'Chicken Sandwich',
    price: 60,
    category: 'Sandwiches & Samoli',
    description: 'Fresh sandwich layered with seasoned chopped chicken fillings, salad greens and classic tandoor spreads.',
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'chicken-samoli',
    name: 'Chicken Samoli',
    price: 70,
    category: 'Sandwiches & Samoli',
    description: 'Traditional long soft samoli roll loaded with spicy minced chicken hash and sweet-sour green chutneys.',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-lollipop',
    name: 'Chicken Lollipop (4 Pcs)',
    price: 100,
    category: 'Crispy Chicken',
    description: 'Classic marinated chicken lollipop drums, dusted in fiery spiced batter and fried extra crisp. Served with hot chutney.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-boneless',
    name: 'Chicken Boneless (3 Pcs)',
    price: 100,
    category: 'Crispy Chicken',
    description: 'Three large juicy boneless chicken strips fried to a crisp, spiced of delicious tandoor marinades.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-nuggets',
    name: 'Chicken Nuggets (3 Pcs)',
    price: 100,
    category: 'Crispy Chicken',
    description: 'Three golden mini chicken breast chunks fried in savory crumbs, ideal for hot dipping snack sessions.',
    image: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'chicken-popcorn',
    name: 'Chicken Popcorn',
    price: 100,
    category: 'Crispy Chicken',
    description: 'Crunchy golden-fried bite-sized chicken popcorn bits seasoned with local spices and direct tandoori dry rub.',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },

  // 🍟 SECTION 3: SIDES & SPECIALS
  {
    id: 'chicken-wings',
    name: 'Chicken Wings (4 Pcs)',
    price: 50,
    category: 'Crispy Chicken',
    description: 'Deep-fried juicy bone-in chicken wings, marinated with hot tandoor spices and dry herb rubs.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-french-fries',
    name: 'Chicken French Fries',
    price: 80,
    category: 'Fries',
    description: 'Thick-cut potato french fries seasoned with classic salt and authentic Indian street chat masala spices.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'chicken-fried-crispy',
    name: 'Chicken Fried Crispy (1 Pc)',
    price: 40,
    category: 'Crispy Chicken',
    description: 'Single large premium chicken strip heavily breaded and hot fried to spectacular golden crispiness.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60',
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'veg-fries',
    name: 'Veg. Fries',
    price: 50,
    category: 'Fries',
    description: 'Golden fries seasoned perfectly with sea salt and street mild chat powders, 100% vegetarian.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false
  }
];

export const CATEGORIES = [
  'All',
  'Combo Deals',
  'Pizza',
  'Burgers & Twisters',
  'Sandwiches & Samoli',
  'Crispy Chicken',
  'Fries'
];

export const RESTAURANT_INFO = {
  name: 'Laziz Chicken Corner',
  phone1: '9926715071',
  phone2: '7566536294',
  partner1: 'Ameer Khan',
  partner2: 'Salman SK',
  address: 'Kahara Bazaar, Near Nanni Bee Masjid, Sironj',
  hours: 'Daily: 11:30 AM to 11:00 PM',
  status: 'Shop Counter Pickup Only',
  mapEmbedPlaceholderUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14400!2d77.689742!3d24.101235!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zTGF6aXogQ2hpY2tlbiBDb3JuZXI!5e0!3m2!1sen!2sin!4v1699999999&t=k'
};

export const GALLERY_IMAGES = [
  {
    title: 'Hot Crispy Display',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    desc: 'Golden hot and crispy boneless and chicken lollipops loaded with our spicy tandoori dry rubs.'
  },
  {
    title: 'Glow Storefront Vibe',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    desc: 'Cinematic warm lights of Laziz Chicken Corner welcoming food lovers near Nanni Bee Masjid.'
  },
  {
    title: 'The Tandoor Spice Oven',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    desc: 'Freshly seasoned, flash cooked crispy and savory, deep fried street style delicacies.'
  },
  {
    title: 'Golden French Fries',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    desc: 'Our hot sliced potato french fries super-sprinkled with authentic Indian chat masala and spices.'
  },
  {
    title: 'Handcrafted Chicken Twisters',
    url: 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=800&q=80',
    desc: 'Crispy golden chicken breast strips wrapped snug in warm grilled tortillas with shredded freshness.'
  }
];

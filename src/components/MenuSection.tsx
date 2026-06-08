import { useState, useEffect } from 'react';
import { Search, Flame, Plus, Minus, Info } from 'lucide-react';
import { INITIAL_MENU_ITEMS, CATEGORIES } from '../data';
import { MenuItem, OrderItem } from '../types';
import { dbService } from '../firebase';

interface MenuSectionProps {
  cartItems: OrderItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export default function MenuSection({
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Track max price filter
  const prices = INITIAL_MENU_ITEMS.map((item) => item.price);
  const maxPricePossible = Math.max(...prices, 300);
  const [maxPrice, setMaxPrice] = useState<number>(maxPricePossible);

  // Track dynamic availability overrides from Firestore or localStorage
  const [availabilityOverrides, setAvailabilityOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = dbService.subscribeMenuItems((overrides) => {
      setAvailabilityOverrides(overrides);
    });
    return () => unsubscribe();
  }, []);

  // Get item quantities within current cart for rendering inline controls
  const getItemQuantity = (itemId: string): number => {
    const found = cartItems.find((ci) => ci.id === itemId);
    return found ? found.quantity : 0;
  };

  // Filter items based on Category Select + Search Query + Max Price Range
  const filteredItems = INITIAL_MENU_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <section id="menu" className="py-20 px-4 md:px-8 bg-flame-dark relative">
      
      {/* Absolute flame styling lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-flame-orange/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-flame-orange mb-2">
              <Flame className="w-5.5 h-5.5 animate-bounce text-flame-orange" />
              <span className="font-accent text-sm uppercase tracking-widest font-bold">100% FRESH STREET FOOD</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-white">
              EXPLORE OUR <span className="text-flame-orange">FIRE</span> MENU
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search spicy burgers, crispy box..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-flame-card border border-white/10 text-white placeholder-flame-gray/80 pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-flame-orange transition-colors font-sans text-sm"
              id="menu-search-input"
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-flame-gray" />
          </div>
        </div>

        {/* Price Range Slider Panel */}
        <div className="bg-flame-card/90 border border-white/10 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-flame-yellow uppercase tracking-widest font-black block">Budget Pricing filter</span>
            <p className="text-xs text-flame-gray mt-1 font-sans">Slide the pointer to set your strict maximum spend budget to filter catalog recipes.</p>
          </div>

          <div className="flex-1 max-w-sm w-full space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono select-none">
              <span className="text-flame-gray">Max Allowed price:</span>
              <span className="text-flame-orange font-bold text-base bg-flame-orange/10 px-2 py-0.5 rounded border border-flame-orange/20">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={40}
              max={300}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FF6B00] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
              id="price-range-slider"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-mono select-none">
              <span>₹40</span>
              <span>₹170</span>
              <span>₹300+</span>
            </div>
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar select-none">
          {CATEGORIES.map((category) => {
            const count = category === 'All'
              ? INITIAL_MENU_ITEMS.length
              : INITIAL_MENU_ITEMS.filter((item) => item.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs font-accent uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === category
                    ? 'bg-flame-orange text-white border-none shadow-md shadow-flame-orange/30 scale-102 font-bold'
                    : 'bg-flame-card border border-white/10 text-flame-gray hover:text-white hover:border-white/20'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  selectedCategory === category
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-flame-gray/80'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Food Items Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-flame-card rounded-lg border border-white/5">
            <Info className="w-12 h-12 text-flame-gray mx-auto mb-4" />
            <p className="text-flame-gray text-base">No spicy entries found matching current filters</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setMaxPrice(300); }}
              className="mt-4 px-4 py-2 bg-flame-orange/10 border border-flame-orange/30 text-flame-orange text-xs rounded hover:bg-flame-orange hover:text-white transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              const isTwister = item.id === 'chicken-twister';
              // Check overrides
              const isAvailable = item.id in availabilityOverrides ? availabilityOverrides[item.id] : item.isAvailable;
              return (
                <div 
                  key={item.id} 
                  className={`bento-card overflow-hidden flex flex-col group select-none transition-all duration-300 ${
                    isTwister 
                      ? 'ring-2 ring-flame-orange/30 hover:ring-flame-orange/60 shadow-lg shadow-flame-orange/5 hover:shadow-flame-orange/15 bg-gradient-to-b from-flame-card to-flame-dark/80 scale-101 hover:scale-[1.02]' 
                      : ''
                  }`}
                >
                  
                  {/* Card Image and spicy badge */}
                  <div className="relative h-56 overflow-hidden bg-zinc-900 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Accent tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 font-mono text-[9px] font-bold text-white uppercase select-none">
                      {isTwister && (
                        <span className="bg-amber-500 text-black border border-amber-400 px-2.5 py-1 rounded shadow-md flex items-center gap-1 animate-pulse">
                          ✨ DRIZZLED TANDOORI MAYO
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="bg-flame-orange border border-flame-orange px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                          <Flame className="w-3 h-3 text-white fill-white animate-pulse" />
                          <span>BEST SELLER</span>
                        </span>
                      )}
                      {item.price > 250 && (
                        <span className="bg-flame-yellow text-flame-black px-2.5 py-1 rounded shadow-md">
                          👑 CHEF SIGNATURE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono text-[10px] uppercase text-flame-yellow bg-flame-yellow/10 border border-flame-yellow/20 px-2 py-0.5 rounded tracking-widest font-bold">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="font-accent text-xl text-white uppercase tracking-wider mt-3 leading-snug group-hover:text-flame-orange transition-colors flex items-center gap-1.5">
                        {item.name}
                        {isTwister && <span className="text-amber-400 text-sm">🌶️</span>}
                      </h3>
                      
                      <p className="font-sans text-xs text-flame-gray mt-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>

                    {/* Pricing Controller and Cart Actions */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-flame-gray font-mono uppercase tracking-widest leading-none">Price (INR)</span>
                        <span className="font-mono text-2xl text-white font-bold tracking-tight mt-1.5 flex items-baseline">
                          ₹{item.price}
                        </span>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-3.5 bg-zinc-800 border border-white/10 p-1.5 rounded-full select-none shadow-inner">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="bg-zinc-700 hover:bg-[#FF6B00] hover:text-black text-flame-gray w-7 h-7 flex items-center justify-center rounded-full transition-colors font-bold text-xs cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold text-white w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="bg-zinc-700 hover:bg-[#FF6B00] hover:text-black text-flame-gray w-7 h-7 flex items-center justify-center rounded-full transition-colors font-bold text-xs cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(item)}
                          disabled={!isAvailable}
                          className={`px-4 py-2.5 rounded-xl text-xs font-accent font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            isAvailable 
                              ? 'bg-[#FF6B00] hover:bg-[#E56000] text-black hover:shadow-lg hover:shadow-[#FF6B00]/30' 
                              : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 text-current" />
                          <span>{isAvailable ? 'Order Now' : 'Sold Out'}</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

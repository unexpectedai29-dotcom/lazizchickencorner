import { Flame, Clock, MapPin, Star, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { RESTAURANT_INFO, INITIAL_MENU_ITEMS } from '../data';
import { MenuItem } from '../types';
import LCCLogo from './LCCLogo';

interface HeroProps {
  onViewMenuClick: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export default function Hero({ onViewMenuClick, onAddToCart }: HeroProps) {
  // Find Chicken Cheese Pizza (or fallback to first item)
  const featuredPizza = INITIAL_MENU_ITEMS.find(item => item.id === 'chicken-cheese-pizza') || INITIAL_MENU_ITEMS[0];
  
  // Find Special: Five in One Meal Box combo item
  const mealBoxCombo = INITIAL_MENU_ITEMS.find(item => item.id === 'five-in-one-meal-box');

  const handleAddFeaturedPizza = () => {
    if (featuredPizza) {
      onAddToCart(featuredPizza);
    }
  };

  const handleAddMealBoxCombo = () => {
    if (mealBoxCombo) {
      onAddToCart(mealBoxCombo);
    }
  };

  return (
    <div id="hero" className="relative bg-[#0B0B0B] py-10 px-4 md:px-10 overflow-hidden">
      
      {/* Flame styling overlay light source */}
      <div className="absolute inset-0 flame-gradient pointer-events-none z-0"></div>

      {/* Grid container */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-5 relative z-10">
        
        {/* Card 1: Core Hero Statement (Col: 7/Row: 4 equivalent in grid) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="col-span-12 lg:col-span-8 bento-card p-6 md:p-10 flex flex-col justify-end relative overflow-hidden min-h-[420px] md:min-h-[500px]"
        >
          
          {/* Animated Background overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/70 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80" 
              alt="Laziz crispy chicken" 
              className="w-full h-full object-cover opacity-20 filter brightness-50 scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF6B00] text-black font-mono text-[10px] font-black px-3 py-1 rounded">
                  MOST POPULAR
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-[#FFC857]">
                  Sironj's Street-Food Legend
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-8xl leading-[0.85] tracking-tight text-white uppercase text-glow">
                HOT.<br />CRISPY.<br /><span className="text-[#FF6B00]">FAST.</span>
              </h1>
              
              <p className="font-sans text-[#BDBDBD] text-sm md:text-lg max-w-lg leading-relaxed">
                Experience authentic hot and crispy taste. Our food is packed with rich Indian spices, crispy crunch, and tandoori flavor made fresh daily in Sironj.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={onViewMenuClick}
                  className="bg-[#FF6B00] hover:bg-[#E56000] text-black font-display text-xl px-8 py-3.5 rounded transition-transform duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-5 h-5 fill-black" />
                  <span>ORDER FOR PICKUP</span>
                </button>
                <button 
                  onClick={onViewMenuClick}
                  className="border border-[#BDBDBD] hover:bg-white/5 font-display text-xl px-8 py-3.5 rounded text-[#F5F5F5] transition-colors cursor-pointer text-center"
                >
                  EXPLORE MENU
                </button>
              </div>
            </div>

            {/* Glowing official LCC Chef Logo centerpiece */}
            <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-black/40 border border-white/5 rounded-2xl relative shrink-0 overflow-hidden md:min-w-[240px] lg:min-w-[280px]">
              <div className="absolute inset-0 bg-[#FF6B00]/5 rounded-2xl blur-xl"></div>
              <LCCLogo size="custom" className="w-52 h-44 sm:w-64 sm:h-56 md:w-52 md:h-44 lg:w-64 lg:h-56 relative z-10" glow={true} />
              <div className="text-center mt-3 relative z-10">
                <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-widest font-bold">Official Neon Sign</span>
                <p className="text-[10px] text-[#BDBDBD] mt-1 max-w-[200px]">The delicious taste of Laziz Chicken Corner, Near Nanni Bee Masjid!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Featured Item: Pizza (Col: 5/Row: 2 equivalent in grid) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col md:flex-row lg:flex-col xl:flex-row items-center gap-6 justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#222] rounded-full shrink-0 flex items-center justify-center overflow-hidden border-2 border-[#FF6B00] relative">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80" 
                alt="Chicken Cheese Pizza"
                className="w-full h-full object-cover scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#FF6B00]/15 animate-ping rounded-full pointer-events-none"></div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FFC857] block mb-1">
                ★ FEATURED DISH
              </span>
              <h3 className="font-display text-2xl text-white mb-1.5 leading-none">
                CHICKEN CHEESE PIZZA
              </h3>
              <p className="text-xs text-[#BDBDBD] line-clamp-2 md:line-clamp-3 leading-relaxed">
                Delicious tandoori chicken chunks, capsicum, onions, and heavy loaded gooey melted cheese slice.
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col lg:flex-row xl:flex-col items-center justify-between w-full md:w-auto lg:w-full xl:w-auto mt-4 md:mt-0 lg:mt-4 xl:mt-0 gap-3 border-t md:border-t-0 lg:border-t xl:border-t-0 border-white/5 pt-3 md:pt-0 lg:pt-3 xl:pt-0 shrink-0">
            <div className="text-left md:text-right lg:text-left xl:text-right">
              <span className="text-[9px] uppercase font-mono text-[#BDBDBD] block leading-none">Price</span>
              <span className="text-[#FFC857] font-display text-2xl">₹119</span>
            </div>
            <button
              onClick={handleAddFeaturedPizza}
              className="bg-[#FF6B00]/10 hover:bg-[#FF6B00] border border-[#FF6B00]/40 hover:text-black text-[#FF6B00] py-2 px-3 rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Quick</span>
            </button>
          </div>
        </motion.div>

        {/* Card 3: Combo Promotion Box for Five in One Meal Box (Col: 3/Row: 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="col-span-12 md:col-span-4 bento-card p-6 bg-gradient-to-br from-[#FF6B00] to-[#FFC857] text-black flex flex-col justify-between min-h-[180px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="border border-black px-2 py-0.5 rounded text-[9px] font-mono font-black tracking-wider block">
                SPECIAL HERO DEAL
              </span>
              <span className="font-display text-sm tracking-wider text-black/80">MEGA VALUE</span>
            </div>
            <h4 className="font-display text-2xl mb-1 leading-tight uppercase font-black">
              5-IN-1 MEAL BOX
            </h4>
            <p className="text-xs font-semibold text-black/90 leading-relaxed font-sans mt-0.5">
              2 Lollipops + 4 Nuggets + 1 Chicken Burger + 1 Chicken Twister + French Fries.
            </p>
          </div>
          
          <div className="flex justify-between items-end border-t border-black/10 pt-4 mt-4">
            <div>
              <span className="text-[9px] uppercase font-mono text-black/60 block leading-none">Grand Total</span>
              <span className="font-display text-2xl text-black">₹270</span>
            </div>
            <button 
              onClick={handleAddMealBoxCombo}
              className="bg-black hover:bg-neutral-900 text-white px-4 py-2 text-xs font-display tracking-wider rounded uppercase cursor-pointer transition-transform active:scale-95 duration-200"
            >
              Add Box Deal
            </button>
          </div>
        </motion.div>

        {/* Card 4: Customer Review (Col: 4/Row: 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="col-span-12 md:col-span-4 bento-card p-6 flex flex-col justify-between min-h-[180px]"
        >
          <div className="flex gap-1 text-[#FFC857] overflow-hidden">
            <Star className="w-4 h-4 fill-current text-[#FFC857]" />
            <Star className="w-4 h-4 fill-current text-[#FFC857]" />
            <Star className="w-4 h-4 fill-current text-[#FFC857]" />
            <Star className="w-4 h-4 fill-current text-[#FFC857]" />
            <Star className="w-4 h-4 fill-current text-[#FFC857]" />
          </div>
          
          <p className="italic font-sans text-sm text-[#BDBDBD] leading-relaxed my-3 font-medium">
            "Absolute best crispy chicken in Sironj. The Chicken Cheese Twister and Lollipops are insanely fresh and highly addictive! 🔥"
          </p>
          
          <div className="border-t border-white/5 pt-3 mt-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#BDBDBD]">
            <span>Rahul S., Local Guide</span>
            <span className="text-[#FF6B00]">✓ Sironj Customer</span>
          </div>
        </motion.div>

        {/* Card 5: Store Status Footer Box (Col: 5/Row: 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="col-span-12 md:col-span-4 bento-card p-6 flex items-center justify-between min-h-[180px]"
        >
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-400">
                  Accepting Orders
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#BDBDBD]">FAST PICKUP</span>
            </div>

            <div>
              <h4 className="font-display text-xl text-white tracking-wide uppercase">
                READY IN 15 MINUTES
              </h4>
              <p className="text-xs text-[#BDBDBD] font-sans mt-1 leading-snug">
                Pick up hot directly from our Sironj storefront once your status is accepted.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#BDBDBD] pt-2 border-t border-white/5">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="truncate">Near Nanni Bee Masjid, Sironj</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

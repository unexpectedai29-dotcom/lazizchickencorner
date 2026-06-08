import { Flame, Star, Award, Heart } from 'lucide-react';
import { RESTAURANT_INFO } from '../data';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 md:px-8 bg-flame-black relative overflow-hidden">
      
      {/* Decorative vertical flame border accent */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-flame-orange via-flame-yellow to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Visual Bento Grid with high quality chicken photography */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-4">
            <div className="bento-card overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80" 
                alt="Crunchy chicken popcorn" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bento-card p-6 flex flex-col items-center justify-center text-center">
              <span className="font-display text-4xl text-flame-orange leading-none">12</span>
              <span className="font-accent text-xs tracking-wider uppercase text-flame-yellow mt-1">Secret Masalas</span>
            </div>
          </div>
          
          <div className="space-y-4 pt-8">
            <div className="bento-card p-6 text-center flex flex-col items-center justify-center">
              <Star className="w-6 h-6 text-flame-yellow animate-spin-slow mb-1" />
              <span className="font-display text-2xl text-white">4.8★</span>
              <span className="font-sans text-[10px] text-flame-gray uppercase tracking-widest mt-1">Google Sironj</span>
            </div>
            <div className="bento-card overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80" 
                alt="Laziz crispy nuggets" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Brand Narrative Story */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          <div className="inline-flex items-center gap-2 text-flame-orange mb-3">
            <Flame className="w-5 h-5 text-flame-orange" />
            <span className="font-accent text-sm uppercase tracking-widest font-semibold">OUR TANDOORI FIRE STORY</span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">
            WHERE TRADITIONAL <span className="text-flame-orange">INDIAN SPICES</span> MEET MODERN STREET CRUNCH.
          </h2>

          <p className="text-flame-gray text-sm md:text-base mt-6 leading-relaxed font-sans">
            Laziz Chicken Corner was born from a simple obsession: <span className="text-white font-medium">making fast food better, spicier, and structurally perfect</span>. 
            Nestled in our hometown of Sironj, near Nanni Bee Masjid, we started as a humble street stall with a single pressure fryer and an old charcoal grill. 
            Today, our commitment to providing extreme crunch paired with dynamic local spices has transformed us into a regional icon.
          </p>

          <p className="text-flame-gray text-sm md:text-base mt-4 leading-relaxed font-sans">
            We don't use bland breadcrumbs or generic frozen meat. Every single tender, wing, or burger patty is hand-breaded, marinated for a minimum of 24 hours 
            in thick yogurt blended with real Indian masalas, and deep-fried at precise engineering configurations. It’s hot, heavy, crispy, and cooked to order.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 border-t border-white/10 pt-8">
            <div className="flex gap-3">
              <div className="p-2 bg-flame-orange/10 rounded-md border border-flame-orange/20 h-max">
                <Award className="w-5 h-5 text-flame-orange" />
              </div>
              <div>
                <h4 className="font-accent text-sm text-white uppercase tracking-wider">Premium Chicken</h4>
                <p className="text-xs text-flame-gray mt-1 leading-normal">Always 100% Halal fresh meat, locally sourced daily.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-flame-yellow/10 rounded-md border border-flame-yellow/20 h-max">
                <Flame className="w-5 h-5 text-flame-yellow" />
              </div>
              <div>
                <h4 className="font-accent text-sm text-white uppercase tracking-wider">Spicy Scale</h4>
                <p className="text-xs text-flame-gray mt-1 leading-normal">Mild to Volcano level marinades. Pick your heat.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-flame-deep/10 rounded-md border border-flame-deep/20 h-max">
                <Heart className="w-5 h-5 text-flame-deep" />
              </div>
              <div>
                <h4 className="font-accent text-sm text-white uppercase tracking-wider">Made With Love</h4>
                <p className="text-xs text-flame-gray mt-1 leading-normal">Sironj street recipe refined with absolute culinary craft.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

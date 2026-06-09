import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Flame } from 'lucide-react';
import { RESTAURANT_INFO } from '../data';
import { dbService } from '../firebase';

export default function ContactSection() {
  const [storeHoursText, setStoreHoursText] = useState(RESTAURANT_INFO.hours);

  useEffect(() => {
    const unsubscribe = dbService.subscribeStoreHours((data) => {
      if (data && data.text) {
        setStoreHoursText(data.text);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <section id="contact" className="py-20 px-4 md:px-8 bg-flame-black relative overflow-hidden">
      
      {/* Decorative radial lighting */}
      <div className="absolute right-10 bottom-10 w-96 h-96 bg-flame-orange/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-flame-orange mb-2">
            <Flame className="w-4 h-4 text-flame-orange" />
            <span className="font-accent text-xs uppercase tracking-widest font-bold">VISIT OUR CORNER</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-white">
            CONTACT & <span className="text-flame-yellow">PICKUP</span> DETAIL
          </h2>
          <p className="font-sans text-sm text-flame-gray max-w-xl mx-auto mt-2">
            Order online, receive notification when live packing resolves, and collect your hot crispy feast from our primary counter!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Detail cards (col span 5) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Address box */}
            <div className="bento-card p-8 flex gap-5 border border-white/5 hover:border-flame-orange/20 transition-all duration-300">
              <div className="p-4 bg-flame-orange/10 border border-flame-orange/25 rounded-xl h-max shrink-0">
                <MapPin className="w-6 h-6 text-flame-orange" />
              </div>
              <div className="flex-1">
                <h4 className="font-accent text-base text-white uppercase tracking-wider font-bold">Our Store Location</h4>
                <p className="text-sm text-flame-gray mt-2.5 leading-relaxed font-sans font-medium">{RESTAURANT_INFO.address}</p>
                <div className="mt-3.5 inline-flex items-center gap-1.5 font-mono text-[10px] text-[#FF9E00] uppercase font-black bg-[#FF9E00]/10 border border-[#FF9E00]/25 px-2.5 py-1 rounded">
                  ★ Sironj's Landmark Spot
                </div>
              </div>
            </div>

            {/* Calling details */}
            <div className="bento-card p-8 flex gap-5 border border-white/5 hover:border-flame-orange/20 transition-all duration-300">
              <div className="p-4 bg-flame-orange/10 border border-flame-orange/25 rounded-xl h-max shrink-0">
                <Phone className="w-6 h-6 text-flame-orange" />
              </div>
              <div className="flex-1">
                <h4 className="font-accent text-base text-white uppercase tracking-wider font-bold">Call For Inquiries</h4>
                <p className="text-sm text-flame-gray mt-2 leading-relaxed font-sans">
                  Phone our shop counter or owners directly for instant orders or pick-up updates:
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-zinc-900 border border-white/5 hover:border-flame-orange/35 p-3.5 rounded-xl transition-all duration-300">
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-widest font-black leading-none">Ameer Khan</span>
                    <a href={`tel:${RESTAURANT_INFO.phone1}`} className="block text-white font-mono text-lg font-black tracking-wide hover:text-flame-orange transition-colors mt-2">
                      {RESTAURANT_INFO.phone1}
                    </a>
                  </div>
                  <div className="bg-zinc-900 border border-white/5 hover:border-flame-orange/35 p-3.5 rounded-xl transition-all duration-300">
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-widest font-black leading-none">Salman SK</span>
                    <a href={`tel:${RESTAURANT_INFO.phone2}`} className="block text-white font-mono text-lg font-black tracking-wide hover:text-flame-orange transition-colors mt-2">
                      {RESTAURANT_INFO.phone2}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Timing Hours */}
            <div className="bento-card p-8 flex gap-5 border border-white/5 hover:border-flame-orange/20 transition-all duration-300">
              <div className="p-4 bg-flame-yellow/10 border border-flame-yellow/25 rounded-xl h-max shrink-0">
                <Clock className="w-6 h-6 text-flame-yellow" />
              </div>
              <div className="flex-1">
                <h4 className="font-accent text-base text-white uppercase tracking-wider font-bold">Operational Clock</h4>
                <p className="text-sm text-flame-gray mt-2 leading-relaxed font-sans">
                  Our pressure fryers and flame grills operate daily on standard street schedules:
                </p>
                <p className="text-base text-white font-extrabold font-accent tracking-widest mt-2 bg-white/5 border border-white/5 inline-block py-1.5 px-3 rounded-lg uppercase">
                  {storeHoursText}
                </p>
              </div>
            </div>

            {/* Shop Counter Pickup Only Graphic Widget */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B00] to-yellow-500 text-black p-6 rounded-2xl flex items-start gap-5 shadow-xl shadow-[#FF6B00]/15 border border-white/10">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
              <div className="p-4 bg-black text-white rounded-2xl shadow-lg shrink-0">
                <MapPin className="w-7 h-7 text-[#FF6B00] fill-[#FF6B00] animate-bounce" />
              </div>
              <div className="relative z-10 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-black tracking-widest">OFFICIAL SERVICE POLICY</span>
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-black">COUNTER PICKUP ONLY</span>
                </div>
                <h5 className="font-display text-2xl uppercase font-black tracking-wide leading-none mt-2 text-black">
                  SHOP PICKUP ONLY FROM COUNTER
                </h5>
                <p className="text-xs font-bold leading-relaxed font-sans text-stone-900 mt-1.5 max-w-sm">
                  To maintain 100% crispy heat, all listings are for direct shop counter pick-up at Kahara Bazaar only. No home delivery structure. Place your orders online for zero waiting time, or call <a href="tel:9926715071" className="underline font-bold font-mono text-black">9926715071</a> to book your order upfront!
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Map embed (col span 7) */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4">
            <div className="h-96 w-full rounded-2xl overflow-hidden border border-white/10 relative bg-[#151515] shadow-2xl shadow-flame-orange/5 min-h-[400px]">
              <iframe 
                src={RESTAURANT_INFO.mapEmbedPlaceholderUrl}
                className="w-full h-full object-cover"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Laziz Location Map"
              />
              {/* Visual float overlay coordinates */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded font-mono text-[9px] text-[#FFA000] uppercase font-bold tracking-wider z-10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Satellite View
              </div>
              <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur border border-flame-orange/20 p-2.5 rounded font-mono text-[9px] text-flame-yellow uppercase z-10">
                📍 SIRONJ COORDS: 24.101235° N, 77.689742° E
              </div>
            </div>

            {/* Directions Button */}
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=24.101235,77.689742" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-gradient-to-r from-flame-orange to-amber-600 hover:from-flame-orange hover:to-[#E05300] text-white font-accent uppercase tracking-wider text-xs font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-flame-orange/20 hover:shadow-flame-orange/30 hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              <span>🚗 Get Directions (Open in Google Maps)</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

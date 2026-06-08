import { Flame, Eye } from 'lucide-react';
import { GALLERY_IMAGES } from '../data';

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 px-4 md:px-8 bg-flame-dark relative border-t border-b border-white/5">
      
      {/* Absolute glow decorative light layer */}
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-flame-orange/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* Title Container */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-flame-yellow mb-2">
            <Flame className="w-4.5 h-4.5" />
            <span className="font-accent text-xs uppercase tracking-widest font-bold">STREET FOOD ATMOSPHERE</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-white">
            LAZIZ <span className="text-flame-orange">FIRE</span> GALLERY
          </h2>
          <p className="font-sans text-sm text-flame-gray max-w-xl mx-auto mt-2">
            A raw glimpse inside Sironj's high-temperature crunch zone. Real kitchens, blazing spice flames, and authentic fast-food gatherings.
          </p>
        </div>

        {/* Dynamic Image Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_IMAGES.map((img, idx) => (
            <div 
              key={idx}
              className="bg-flame-card border border-white/5 rounded-lg overflow-hidden relative group hover:border-flame-orange/40 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image box */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Overlay Zoom Indicator */}
                <div className="absolute inset-0 bg-flame-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="p-3 bg-flame-orange rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Informative Label */}
              <div className="p-4 border-t border-white/5">
                <h3 className="font-accent text-sm text-white uppercase tracking-wider">{img.title}</h3>
                <p className="text-xs text-flame-gray mt-1 font-sans leading-normal">{img.desc}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

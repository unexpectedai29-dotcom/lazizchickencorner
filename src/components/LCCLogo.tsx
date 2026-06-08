import React from 'react';

interface LCCLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  glow?: boolean;
}

export default function LCCLogo({ className = '', size = 'md', glow = true }: LCCLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-10',
    md: 'w-24 h-20',
    lg: 'w-48 h-40',
    xl: 'w-72 h-60',
    custom: '',
  };

  return (
    <div className={`relative select-none flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer Glow Overlay */}
      {glow && (
        <div className="absolute inset-0 bg-[#FF6B00] rounded-2xl blur-xl opacity-25 animate-pulse-slow pointer-events-none"></div>
      )}

      {/* SVG Canvas depicting the official neon board */}
      <svg
        viewBox="0 0 500 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-[0_4px_12px_rgba(255,107,0,0.4)] ${glow ? 'animate-flicker-subtle' : ''}`}
      >
        {/* Definition for Filters & Gradients (such as the neon glow) */}
        <defs>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="neonOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#D03B00" />
          </linearGradient>

          <linearGradient id="neonWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F5F5EC" />
          </linearGradient>
        </defs>

        {/* 1. Main White Acrylic Backplate / Board */}
        {/* Rounded contoured path enclosing the whole shape of the uploaded logo */}
        <path
          d="M 120 180 
             C 100 130, 80 120, 100 80 
             C 110 50, 160 50, 175 90 
             C 185 110, 200 130, 205 135 
             C 215 110, 230 70, 275 75 
             C 320 80, 360 81, 375 140 
             C 380 160, 395 160, 420 140 
             C 455 115, 485 140, 475 220 
             C 465 240, 420 250, 410 260 
             C 400 270, 420 290, 418 315 
             C 415 348, 380 345, 340 345 
             L 160 345 
             C 100 345, 65 340, 68 310 
             C 70 280, 95 260, 120 250 
             L 120 180"
          fill="url(#neonWhiteGrad)"
          stroke="#FF5500"
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Inner stroke line around acrylic plate */}
        <path
          d="M 122 178 
             C 103 133, 85 125, 102 85 
             C 112 58, 158 58, 172 93 
             C 181 113, 204 139, 207 142 
             C 217 114, 232 75, 274 79 
             C 317 83, 355 85, 371 142 
             C 377 163, 396 163, 418 145 
             C 450 122, 477 145, 468 218 
             C 458 238, 417 246, 407 256 
             L 122 178"
          stroke="#FFAA66"
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* 2. Left Side Spatula & Hand */}
        {/* Hand grip on left spatula */}
        <g id="left-hand-spatula" stroke="url(#neonOrangeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {/* Spatula Blade */}
          <rect x="85" y="40" width="60" height="60" rx="10" fill="#FFEFEA" stroke="#FF5500" strokeWidth="6" />
          {/* Spatula Slots */}
          <line x1="97" y1="50" x2="97" y2="90" stroke="#FF5500" strokeWidth="5" />
          <line x1="107" y1="50" x2="107" y2="90" stroke="#FF5500" strokeWidth="5" />
          <line x1="117" y1="50" x2="117" y2="90" stroke="#FF5500" strokeWidth="5" />
          <line x1="127" y1="50" x2="127" y2="90" stroke="#FF5500" strokeWidth="5" />
          <line x1="137" y1="50" x2="137" y2="90" stroke="#FF5500" strokeWidth="5" />
          
          {/* Spatula Stem / Handle Connection */}
          <path d="M 115 100 L 125 150" stroke="#FF5500" strokeWidth="8" />

          {/* Gripping Fist (Fingers wrapping around handle) */}
          <path d="M 112 120 C 102 120 95 125 95 135 C 95 145 105 145 115 145" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 114 130 C 104 130 97 135 97 145 C 97 155 107 155 117 155" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 116 140 C 106 140 99 145 99 155 C 99 165 109 165 119 165" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 118 150 C 108 150 101 155 101 165 C 101 175 111 175 121 175" fill="none" stroke="#FF5500" strokeWidth="5" />
          
          {/* Thumb details */}
          <path d="M 130 130 C 142 130 148 140 138 148 C 130 154 125 145 125 140" fill="none" stroke="#FF5500" strokeWidth="5" />
        </g>

        {/* 3. Right Side Spatula & Hand */}
        {/* Flat solid cookie turner spatula and gripping hand */}
        <g id="right-hand-spatula" stroke="url(#neonOrangeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {/* Spatula Blade (solid with round corners tilted) */}
          <path d="M 390 120 L 450 140 L 435 190 L 375 170 Z" fill="#FF5500" stroke="#FF5500" strokeWidth="6" />
          
          {/* Spatula connection */}
          <path d="M 395 175 L 365 215" stroke="#FF5500" strokeWidth="8" />

          {/* Gripping fist holding right spatula */}
          <path d="M 370 195 C 378 195 385 200 385 208 C 385 216 375 216 367 216" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 365 205 C 373 205 380 210 380 218 C 380 226 370 226 362 226" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 360 215 C 368 215 375 220 375 228 C 375 236 365 236 357 236" fill="none" stroke="#FF5500" strokeWidth="5" />
          <path d="M 355 225 C 363 225 370 230 370 238 C 370 246 360 246 352 246" fill="none" stroke="#FF5500" strokeWidth="5" />
          
          {/* Knuckle thumb outline */}
          <path d="M 345 205 C 335 205 328 215 338 223 C 345 228 350 220 350 215" fill="none" stroke="#FF5500" strokeWidth="5" />
        </g>

        {/* 4. Center Chef Hat */}
        <g id="chef-hat" stroke="#FF5500" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {/* White Hat Base Fill */}
          <path d="M 215 130 C 200 90, 240 55, 275 75 C 310 50, 360 90, 340 135 Z" fill="#FFFFFF" stroke="none" />
          {/* Puffy Hat folds */}
          <path d="M 215 130 
                   C 195 105, 195 70, 230 75
                   C 240 45, 290 40, 305 70
                   C 335 45, 370 80, 345 130" 
                fill="none" 
                stroke="#FF5500" 
                strokeWidth="7" />
          {/* Hat headband / bottom brim */}
          <path d="M 213 130 Q 280 148 347 130 L 343 148 Q 280 166 217 148 Z" fill="#FFEFEA" stroke="#FF5500" strokeWidth="6" />
          {/* Inner details */}
          <path d="M 250 85 Q 280 115 285 135" fill="none" stroke="#FFAA66" strokeWidth="3" />
          <path d="M 310 82 Q 295 110 300 135" fill="none" stroke="#FFAA66" strokeWidth="3" />
        </g>

        {/* 5. Three Distinct Compartment Boxes for Ornate "L - C - C" */}
        <g id="lcc-boxes">
          {/* Box 1 (L) */}
          <rect x="80" y="180" width="100" height="95" rx="8" fill="#FFF2ED" stroke="#FF5500" strokeWidth="5" />
          <rect x="86" y="186" width="88" height="83" rx="4" fill="none" stroke="#FFAA66" strokeWidth="2" strokeDasharray="4 2" />
          {/* Calligraphic Flourish Letter L */}
          <path d="M 112 205 H 145 M 122 205 V 242 Q 122 255 110 255 H 144 M 144 246" stroke="#D03B00" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 122 205 C 105 205 100 220 118 220" stroke="#FF5500" strokeWidth="3" fill="none" />

          {/* Box 2 (C) */}
          <rect x="190" y="180" width="100" height="95" rx="8" fill="#FFF2ED" stroke="#FF5500" strokeWidth="5" />
          <rect x="196" y="186" width="88" height="83" rx="4" fill="none" stroke="#FFAA66" strokeWidth="2" strokeDasharray="4 2" />
          {/* Calligraphic Flourish Letter C */}
          <path d="M 252 207 C 235 202 218 212 218 230 C 218 248 235 258 252 253" stroke="#D03B00" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 248 202 C 260 205 264 216 250 220" stroke="#FF5500" strokeWidth="3" fill="none" />
          <path d="M 248 258 C 260 255 264 244 250 240" stroke="#FF5500" strokeWidth="3" fill="none" />

          {/* Box 3 (C) */}
          <rect x="300" y="180" width="100" height="95" rx="8" fill="#FFF2ED" stroke="#FF5500" strokeWidth="5" />
          <rect x="306" y="186" width="88" height="83" rx="4" fill="none" stroke="#FFAA66" strokeWidth="2" strokeDasharray="4 2" />
          {/* Calligraphic Flourish Letter C */}
          <path d="M 362 207 C 345 202 328 212 328 230 C 328 248 345 258 362 253" stroke="#D03B00" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 358 202 C 370 205 374 216 360 220" stroke="#FF5500" strokeWidth="3" fill="none" />
          <path d="M 358 258 C 370 255 374 244 360 240" stroke="#FF5500" strokeWidth="3" fill="none" />
        </g>

        {/* 6. Lower Banner with "LAZIZ CHICKEN CORNER" text */}
        <g id="brand-banner">
          {/* Banner Backplate */}
          <path
            d="M 60 290 
               L 420 290 
               C 435 290, 440 295, 435 310 
               L 425 335 
               C 420 345, 410 345, 395 345 
               L 85 345 
               C 70 345, 60 345, 55 335 
               L 45 310 
               C 40 295, 45 290, 60 290 Z"
            fill="url(#neonWhiteGrad)"
            stroke="#FF5500"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          
          {/* Inner panel styling */}
          <path
            d="M 64 296 L 416 296 L 405 339 L 75 339 Z"
            fill="none"
            stroke="#FFAA66"
            strokeWidth="1.5"
          />

          {/* "LAZIZ CHICKEN CORNER" Text rendered via precise SVG path letters to ensure custom typeface rendering on all systems perfectly */}
          <text
            x="240"
            y="323"
            textAnchor="middle"
            fill="#D03B00"
            stroke="#FF5500"
            strokeWidth="0.8"
            fontFamily="Oswald, Anton, sans-serif"
            fontSize="25"
            fontWeight="900"
            letterSpacing="3.5"
          >
            LAZIZ CHICKEN CORNER
          </text>
        </g>
      </svg>
    </div>
  );
}

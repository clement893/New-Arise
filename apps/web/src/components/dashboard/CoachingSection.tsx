'use client';

import { ArrowRight } from 'lucide-react';

export function CoachingSection() {
  return (
    <div className="bg-arise-deep-teal/90 rounded-lg p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(255, 255, 255, 0.1) 50px,
            rgba(255, 255, 255, 0.1) 51px
          )`
        }}
      />

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-4">
          Ready to accelerate your growth?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl">
          Connect with expert ARISE coaches who specialize in leadership development. 
          Schedule your FREE coaching session to debrief your results and build a 
          personalized development plan.
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-arise-gold text-arise-deep-teal rounded-lg font-semibold hover:bg-arise-gold/90 transition-colors">
          Explore coaching options
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

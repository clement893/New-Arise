'use client';

export function BuildingLeadersSection() {
  return (
    <section className="py-20 bg-arise-light-beige border-t-4 border-b-4 border-dotted border-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-arise-deep-teal mb-4">
              Building leaders
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl">
              Leadership development is not just about skills and competencies. It's about cultivating authentic leaders 
              who understand themselves, inspire others, and create lasting impact. Our holistic approach combines 
              cutting-edge assessments with personalized insights to help leaders thrive.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 1</span>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-gold/20 to-arise-deep-teal/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 2</span>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/30 to-arise-gold/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 3</span>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md col-span-2 md:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-gold/30 to-arise-deep-teal/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 4</span>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/25 to-arise-gold/25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 5</span>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-arise-gold/25 to-arise-deep-teal/25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Leadership Image 6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

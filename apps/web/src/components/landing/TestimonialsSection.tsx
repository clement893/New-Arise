'use client';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "ARISE transformed how I understand my leadership style. The comprehensive assessment gave me insights I never had before.",
      author: "Sarah Johnson",
      role: "CEO, Tech Innovations"
    },
    {
      quote: "The 360° feedback combined with personality assessments provided a complete picture of my strengths and areas for growth.",
      author: "Michael Chen",
      role: "VP Operations, Global Corp"
    },
    {
      quote: "As a coach, ARISE has become an invaluable tool for helping my clients develop authentic leadership capabilities.",
      author: "Dr. Emily Rodriguez",
      role: "Executive Coach"
    }
  ];

  return (
    <section className="py-20 bg-arise-light-beige border-t-4 border-b-4 border-dotted border-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-arise-deep-teal mb-12 text-center">
            What leaders say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-800 rounded-lg p-6 text-white shadow-lg"
              >
                <div className="mb-4">
                  <svg 
                    className="w-10 h-10 text-arise-gold" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="border-t border-white/20 pt-4">
                  <p className="font-semibold text-arise-gold">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-white/70">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

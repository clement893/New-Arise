'use client';

import { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import MotionDiv from '@/components/motion/MotionDiv';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-arise-deep-teal" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">
                Contact Us
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:contact@arise.com" className="text-arise-deep-teal hover:underline">
                      contact@arise.com
                    </a>
                    <p className="text-sm text-gray-600 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+1234567890" className="text-arise-deep-teal hover:underline">
                      +1 (234) 567-890
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700">
                      123 Leadership Avenue<br />
                      Suite 100<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Hours</h3>
                    <p className="text-gray-700 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick FAQ */}
            <Card className="p-6 bg-arise-gold/5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <a href="/help/faq" className="text-arise-deep-teal hover:underline text-sm">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-arise-deep-teal hover:underline text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-arise-deep-teal hover:underline text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-arise-deep-teal hover:underline text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="!bg-arise-deep-teal hover:!bg-arise-deep-teal/90 !text-white flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500">
                      * Required fields
                    </p>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

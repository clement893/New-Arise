'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, Alert } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import MotionDiv from '@/components/motion/MotionDiv';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { apiClient } from '@/lib/api';
import { AxiosError } from 'axios';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/v1/contact', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      
      if (response.data?.success) {
        setSuccessMessage(response.data?.message || 'Votre message a été envoyé avec succès ! Vous recevrez un email de confirmation sous peu.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Reset success message after 8 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 8000);
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-arise-deep-teal" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Success Message */}
        {successMessage && (
          <MotionDiv variant="fade" duration="fast">
            <Alert variant="success" className="mb-6" onClose={() => {
              setSuccessMessage(null);
            }}>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Message envoyé avec succès !</h3>
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              </div>
            </Alert>
          </MotionDiv>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('getInTouch.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.email')}</h3>
                    <a href="mailto:contact@arise.com" className="text-arise-deep-teal hover:underline">
                      contact@arise.com
                    </a>
                    <p className="text-sm text-gray-600 mt-1">{t('getInTouch.emailText')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.phone')}</h3>
                    <a href="tel:+1234567890" className="text-arise-deep-teal hover:underline">
                      +1 (234) 567-890
                    </a>
                    <p className="text-sm text-gray-600 mt-1">{t('getInTouch.phoneText')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.address')}</h3>
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
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.officeHours')}</h3>
                    <p className="text-gray-700 text-sm">
                      {t('getInTouch.officeHoursText')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick FAQ */}
            <Card className="bg-arise-gold/5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('quickLinks.title')}</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/help/faq" className="text-arise-deep-teal hover:underline text-sm">
                    {t('quickLinks.faq')}
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-arise-deep-teal hover:underline text-sm">
                    {t('quickLinks.helpCenter')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-arise-deep-teal hover:underline text-sm">
                    {t('quickLinks.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-arise-deep-teal hover:underline text-sm">
                    {t('quickLinks.terms')}
                  </Link>
                </li>
              </ul>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.name')} *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('form.name')}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.email')} *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('form.email')}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.subject')} *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    >
                      <option value="">{t('form.selectSubject')}</option>
                      <option value="general">{t('form.general')}</option>
                      <option value="support">{t('form.support')}</option>
                      <option value="billing">{t('form.billing')}</option>
                      <option value="partnership">{t('form.partnership')}</option>
                      <option value="feedback">{t('form.feedback')}</option>
                      <option value="other">{t('form.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('form.placeholder')}
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
                          {t('form.sending')}
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {t('form.sendMessage')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

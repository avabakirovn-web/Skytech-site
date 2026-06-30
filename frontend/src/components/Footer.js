import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#0A2540] text-white mt-20 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 bg-white/10 rounded-2xl p-3 inline-block">
              <Logo size="md" className="brightness-0 invert" />
            </div>
            <p className="text-gray-300 mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/skytech_uz?igsh=OThnY3J0aXAzbnhq" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://t.me/skytech_shop" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all" data-testid="social-telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all" data-testid="social-youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-all">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.contact_us')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.customer_service')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.shipping_info')}
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.warranty')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-all">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-1" />
                <span className="text-gray-300">Toshkent vil., Angren shahar</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                <a href="tel:+998948846446" className="text-gray-300 hover:text-white transition-all" data-testid="footer-phone">+998 94 884 64 46</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                <a href="mailto:info@skytech.uz" className="text-gray-300 hover:text-white transition-all">info@skytech.uz</a>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-[#3B82F6] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <a href="https://t.me/skytech_shop" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-all" data-testid="footer-telegram">@skytech_shop</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2">{t('footer.newsletter_title')}</h4>
            <p className="text-gray-300 mb-4">{t('footer.newsletter_subtitle')}</p>
            <form className="flex gap-2" data-testid="newsletter-form">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none"
                data-testid="newsletter-email"
              />
              <button
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl px-6 py-2.5 font-medium transition-all"
                data-testid="newsletter-submit"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; 2024 SkyTech. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

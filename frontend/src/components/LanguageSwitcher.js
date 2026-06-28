import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
        data-testid="lang-switcher"
      >
        <Globe className="w-5 h-5 text-[#0A2540] dark:text-white" />
        <span className="hidden sm:inline text-sm font-medium text-[#0A2540] dark:text-white uppercase">
          {current.code}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0A2540] rounded-2xl shadow-lg border border-black/5 dark:border-white/10 overflow-hidden z-50" data-testid="lang-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => change(lang.code)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
                  i18n.language === lang.code ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#0A2540] dark:text-white'
                }`}
                data-testid={`lang-${lang.code}`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </span>
                {i18n.language === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

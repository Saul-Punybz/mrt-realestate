type Lang = 'es' | 'en' | 'it';

let translations: Record<string, string> = {};
let currentLang: Lang = 'es';

function getLang(): Lang {
  return (localStorage.getItem('lang') as Lang) || 'es';
}

function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  updateSwitcherUI(lang);
  if (lang === 'es') {
    restoreOriginals();
  } else {
    applyTranslations();
  }
}

function updateSwitcherUI(lang: Lang) {
  document.querySelectorAll<HTMLButtonElement>('[data-lang-btn]').forEach((btn) => {
    const btnLang = btn.dataset.langBtn;
    if (btnLang === lang) {
      btn.classList.add('text-gold-500', 'font-bold');
      btn.classList.remove('text-white/70', 'hover:text-white');
    } else {
      btn.classList.remove('text-gold-500', 'font-bold');
      btn.classList.add('text-white/70', 'hover:text-white');
    }
  });
  // Mobile switcher
  document.querySelectorAll<HTMLButtonElement>('[data-lang-btn-mobile]').forEach((btn) => {
    const btnLang = btn.dataset.langBtnMobile;
    if (btnLang === lang) {
      btn.classList.add('text-gold-500', 'font-bold');
      btn.classList.remove('text-white/60');
    } else {
      btn.classList.remove('text-gold-500', 'font-bold');
      btn.classList.add('text-white/60');
    }
  });
}

function storeOriginals() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    if (!el.dataset.i18nOriginal) {
      el.dataset.i18nOriginal = el.textContent?.trim() || '';
    }
  });
  // Also store data-i18n-placeholder originals
  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    if (!el.dataset.i18nPlaceholderOriginal && el instanceof HTMLInputElement) {
      el.dataset.i18nPlaceholderOriginal = el.placeholder || '';
    }
  });
}

function restoreOriginals() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    if (el.dataset.i18nOriginal !== undefined) {
      el.textContent = el.dataset.i18nOriginal;
    }
  });
}

function applyTranslations() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });
}

async function loadTranslations(lang: Lang): Promise<Record<string, string>> {
  if (lang === 'es') return {};
  const resp = await fetch(`/i18n/${lang}.json`);
  if (!resp.ok) return {};
  return resp.json();
}

async function init() {
  storeOriginals();
  const lang = getLang();
  if (lang !== 'es') {
    translations = await loadTranslations(lang);
    currentLang = lang;
    document.documentElement.lang = lang;
    applyTranslations();
  }
  updateSwitcherUI(lang);

  // Wire up switcher buttons
  document.querySelectorAll<HTMLButtonElement>('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.langBtn as Lang;
      if (lang === currentLang) return;
      if (lang !== 'es') {
        translations = await loadTranslations(lang);
      }
      setLang(lang);
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-lang-btn-mobile]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.langBtnMobile as Lang;
      if (lang === currentLang) return;
      if (lang !== 'es') {
        translations = await loadTranslations(lang);
      }
      setLang(lang);
    });
  });
}

// Run on DOMContentLoaded and on Astro page transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('astro:page-load', init);

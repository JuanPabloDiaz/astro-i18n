// Define the languages your site supports
export const languages = {
  en: 'English',
  es: 'Español',
};

// Define the default language
export const defaultLang = 'en';

// Option to hide default language in URL
export const showDefaultLang = true;

// Define UI string translations
export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    
    // Footer translations
    'footer.quickLinks': 'Quick Links',
    'footer.socials': 'Socials',
    'footer.location': 'Location & Contact',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Sobre Nosotros',
    'nav.services': 'Servicios',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',
    
    // Footer translations
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.socials': 'Redes Sociales',
    'footer.location': 'Ubicación y Contacto',
  },
} as const;

// Define routes that should be translated
export const routes = {
  es: {
    'about': 'sobre-nosotros',
    'services': 'servicios',
    'contact': 'contacto',
  },
}; 
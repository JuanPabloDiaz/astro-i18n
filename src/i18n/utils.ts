import { ui, languages, defaultLang, showDefaultLang, routes } from './ui';

// Re-export for convenience
export { ui, languages, defaultLang, showDefaultLang, routes };

/**
 * Get the language from the URL
 */
export function getLangFromUrl(url: URL): keyof typeof ui {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) {
    return lang as keyof typeof ui;
  }
  return defaultLang;
}

/**
 * Get translations for UI strings
 */
export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

/**
 * Build a path based on language
 */
export function getPathForLang(path: string, lang: keyof typeof languages): string {
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Create a translated path based on language
 */
export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: keyof typeof ui = lang) {
    // Check if the path should be translated based on routes
    const pathName = path.replace(/\//g, '');
    
    // Type safe checks for routes
    let translatedPath = path;
    
    if (l in routes && l !== defaultLang) {
      const routeMap = routes[l];
      if (pathName in routeMap) {
        translatedPath = '/' + routeMap[pathName as keyof typeof routeMap];
      }
    }
    
    // Handle whether to show default language in URL
    return !showDefaultLang && l === defaultLang 
      ? translatedPath 
      : `/${l}${translatedPath}`;
  }
}

/**
 * Create a localized path from the current path
 */
export function createLocalizedPath(pathname: string, lang: string): string {
  console.log(`createLocalizedPath - Input: pathname=${pathname}, lang=${lang}`);
  
  // Get current path segments
  const segments = pathname.split('/').filter(Boolean);
  console.log(`createLocalizedPath - Original segments: [${segments.join(', ')}]`);
  
  // If first segment is a language code, remove it
  if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
    segments.shift();
    console.log(`createLocalizedPath - Removed language prefix, segments now: [${segments.join(', ')}]`);
  }
  
  // Check if we need to translate the route
  if (segments.length > 0 && lang !== defaultLang && 
      routes[lang as keyof typeof routes]) {
    const routeMap = routes[lang as keyof typeof routes];
    const firstSegment = segments[0];
    
    // Try to find a translation for the route
    if (firstSegment in routeMap) {
      // TypeScript-safe way to access the route
      segments[0] = routeMap[firstSegment as keyof typeof routeMap];
    }
  }
  
  // Construct new path with target language
  const newPath = `/${lang}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
  console.log(`createLocalizedPath - Created new path: ${newPath}`);
  return newPath;
}

/**
 * Get the route name from the current URL
 */
export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = url.pathname;
  const parts = pathname?.split('/');
  const path = parts.pop() || parts.pop();

  if (path === undefined) {
    return undefined;
  }

  const currentLang = getLangFromUrl(url);

  if (defaultLang === currentLang) {
    // For default language, just return the path
    return path;
  }

  // For other languages, check if it's a translated route and get original
  if (routes[currentLang as keyof typeof routes]) {
    const routesForLang = routes[currentLang as keyof typeof routes];
    
    // Find the key (original route) by the translated value
    const getKeyByValue = <T extends Record<string, string>>(obj: T, value: string): keyof T | undefined => {
      return Object.keys(obj).find(key => obj[key as keyof T] === value) as keyof T | undefined;
    }
    
    const originalRoute = getKeyByValue(routesForLang, path);
    if (originalRoute) {
      return originalRoute as string;
    }
  }

  // If not a translated route, return as is
  return path;
}

/**
 * Helper to find the correct content entry from a collection based on language
 * This handles content stored in language-specific directories
 */
export async function getLocalizedEntry<T>(
  collection: () => Promise<Array<{ id: string; [key: string]: any }>>, 
  baseName: string, 
  lang: string,
  contentType: string = "homepage" // Default to homepage content
): Promise<T | null> {
  // Get all entries from the collection
  const allEntries = await collection();
  console.log(`[DEBUG-${lang.toUpperCase()}] getLocalizedEntry - Found ${allEntries.length} entries in collection`);
  
  // Log all entries for debugging
  console.log(`[DEBUG-${lang.toUpperCase()}] All available entry IDs for ${contentType}:`);
  allEntries.forEach(entry => {
    const hasLang = entry.id.includes(`/${lang}/`) || entry.id.includes(`.${lang}`) || entry.id.startsWith(`${lang}/`);
    console.log(`[DEBUG-${lang.toUpperCase()}]   - "${entry.id}" (LANG MATCH: ${hasLang ? '✅' : '❌'})`);
  });

  // Try multiple ID formats to be more resilient
  const possibleIds = [
    // Primary pattern - lang/contentType/baseName
    `${lang}/${contentType}/${baseName}`,
    // Alternative patterns
    `${contentType}/${baseName}.${lang}`,
    `${contentType}/${lang}/${baseName}`,
    `${contentType}/${baseName}`,
    `${lang}/${baseName}`
  ];
  
  console.log(`[DEBUG-${lang.toUpperCase()}] Looking for content with one of these IDs:`);
  possibleIds.forEach(id => console.log(`[DEBUG-${lang.toUpperCase()}]   - ${id}`));
  
  // Try each possible ID pattern
  let entry = null;
  for (const possibleId of possibleIds) {
    console.log(`[DEBUG-${lang.toUpperCase()}] Trying ID: "${possibleId}"`);
    
    // Try exact match and suffix match
    const exactMatch = allEntries.find(entry => entry.id === possibleId);
    if (exactMatch) {
      console.log(`[DEBUG-${lang.toUpperCase()}] ✅ EXACT match found: "${exactMatch.id}"`);
      entry = exactMatch;
      break;
    }
    
    // Try suffix match
    const suffixMatch = allEntries.find(entry => entry.id.endsWith(possibleId));
    if (suffixMatch) {
      console.log(`[DEBUG-${lang.toUpperCase()}] ✅ SUFFIX match found: "${suffixMatch.id}"`);
      entry = suffixMatch;
      break;
    }
  }
  
  // If no exact match, try to find any entry containing the language code
  if (!entry) {
    console.log(`[DEBUG-${lang.toUpperCase()}] No exact ID match, looking for any entry containing '${lang}'`);
    
    // First priority: entries that start with language code
    entry = allEntries.find(entry => entry.id.startsWith(`${lang}/`));
    if (entry) {
      console.log(`[DEBUG-${lang.toUpperCase()}] ✅ Found entry starting with language code: "${entry.id}"`);
    } else {
      // Second priority: entries that contain language code
      entry = allEntries.find(entry => entry.id.includes(`/${lang}/`) || entry.id.includes(`.${lang}`));
      if (entry) {
        console.log(`[DEBUG-${lang.toUpperCase()}] ✅ Found entry containing language code: "${entry.id}"`);
      }
    }
  }
  
  // Final fallback to default language
  if (!entry && lang !== 'en') {
    console.log(`[DEBUG-${lang.toUpperCase()}] No ${lang} entry found, falling back to English`);
    return getLocalizedEntry<T>(collection, baseName, 'en', contentType);
  }
  
  // Super fallback - just pick the first entry
  if (!entry && allEntries.length > 0) {
    entry = allEntries[0];
    console.log(`[DEBUG-${lang.toUpperCase()}] Using first available entry as last resort: "${entry.id}"`);
  }
  
  if (entry) {
    console.log(`[DEBUG-${lang.toUpperCase()}] Final selected entry: "${entry.id}"`);
    return entry as unknown as T;
  }
  
  console.log(`[DEBUG-${lang.toUpperCase()}] ❌ No entry found with any ID pattern - collection is empty!`);
  return null;
}

/**
 * Get a content ID for a specific file
 */
export function getContentIdForLang(lang: string, basename: string = "index"): string {
  if (lang === defaultLang) {
    return basename;
  }
  return `${basename}.${lang}`;
} 
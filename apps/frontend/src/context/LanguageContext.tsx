import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';

export type Language = 'en' | 'hi';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isHindi: boolean;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<string, { en: string; hi: string }> = {
  // Application & Ministry
  'app_name': {
    en: 'National Land Governance Platform',
    hi: 'राष्ट्रीय भूमि शासन मंच',
  },
  'app_tagline': {
    en: 'SIH PS 26019 · Centralized Land Records & Policy Intelligence',
    hi: 'एसआईएच पीएस 26019 · केंद्रीकृत भूमि अभिलेख एवं नीतिगत विश्लेषण',
  },
  'gov_india': {
    en: 'Government of India',
    hi: 'भारत सरकार',
  },
  'gov_india_banner': {
    en: 'भारत सरकार | Government of India',
    hi: 'भारत सरकार | Government of India',
  },
  'accessibility_tools': {
    en: 'Accessibility tools',
    hi: 'पहुंच उपकरण (Accessibility)',
  },
  'screen_reader': {
    en: 'Screen Reader',
    hi: 'स्क्रीन रीडर',
  },
  'dolr': {
    en: 'Department of Land Resources',
    hi: 'भू-संसाधन विभाग',
  },
  'mord': {
    en: 'Ministry of Rural Development',
    hi: 'ग्रामीण विकास मंत्रालय',
  },
  'dolr_full': {
    en: 'Department of Land Resources',
    hi: 'भू-संसाधन विभाग',
  },
  'mord_full': {
    en: 'Ministry of Rural Development',
    hi: 'ग्रामीण विकास मंत्रालय',
  },
  'search_platform': {
    en: 'Search the platform',
    hi: 'मंच पर खोजें',
  },
  'search_placeholder': {
    en: 'Search policies, documents, datasets...',
    hi: 'नीतियां, दस्तावेज़, डेटासेट खोजें...',
  },
  'notifications': {
    en: 'Notifications',
    hi: 'सूचनाएं',
  },
  'notification_center': {
    en: 'Notification Center',
    hi: 'सूचना केंद्र',
  },
  'settings': {
    en: 'Settings',
    hi: 'सेटिंग्स',
  },
  'alert_preferences': {
    en: 'Alert Preferences',
    hi: 'सूचना प्राथमिकताएं',
  },
  'no_new_notifications': {
    en: 'No new notifications',
    hi: 'कोई नई सूचना नहीं है',
  },
  'back_to_notifications': {
    en: 'Back to Notifications',
    hi: 'सूचनाओं पर वापस जाएं',
  },
  'ministry': {
    en: 'Ministry',
    hi: 'मंत्रालय',
  },
  'workspaces': {
    en: 'Workspaces',
    hi: 'कार्यक्षेत्र',
  },
  'simulations': {
    en: 'Simulations',
    hi: 'सिमुलेशन',
  },
  'sign_in': {
    en: 'Sign In',
    hi: 'साइन इन',
  },
  'logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
  },
  'create_account': {
    en: 'Create Account',
    hi: 'खाता बनाएं',
  },
  'role_label': {
    en: 'Role',
    hi: 'भूमिका',
  },

  // Navigation Items
  'Overview': {
    en: 'Overview',
    hi: 'अवलोकन',
  },
  'Repository': {
    en: 'Repository',
    hi: 'दस्तावेज़ भंडार',
  },
  'GIS Map': {
    en: 'GIS Map',
    hi: 'भू-मानचित्र (GIS)',
  },
  'Innovation Portal': {
    en: 'Innovation Portal',
    hi: 'नवाचार पोर्टल',
  },
  'Workspaces': {
    en: 'Workspaces',
    hi: 'कार्यक्षेत्र',
  },
  'AI Assistant': {
    en: 'AI Assistant',
    hi: 'एआई सहायक',
  },
  'Synthesis': {
    en: 'Synthesis',
    hi: 'नीति संश्लेषण',
  },
  'Policy Simulator': {
    en: 'Policy Simulator',
    hi: 'नीति सिम्युलेटर',
  },
  'Analytics Hub': {
    en: 'Analytics Hub',
    hi: 'विश्लेषण केंद्र',
  },
  'Admin Console': {
    en: 'Admin Console',
    hi: 'व्यवस्थापक कंसोल',
  },
  'Developer API': {
    en: 'Developer API',
    hi: 'डेवलपर एपीआई',
  },
  'platform_workspace': {
    en: 'Platform workspace',
    hi: 'मंच कार्यक्षेत्र',
  },
  'public_access': {
    en: 'Public access',
    hi: 'सार्वजनिक नागरिक पहुंच',
  },
  'portal': {
    en: 'portal',
    hi: 'पोर्टल',
  },
  'expand_sidebar': {
    en: 'Expand sidebar',
    hi: 'साइडबार विस्तृत करें',
  },
  'collapse_sidebar': {
    en: 'Collapse sidebar',
    hi: 'साइडबार संक्षिप्त करें',
  },

  // Roles
  'Public': {
    en: 'Public Citizen',
    hi: 'नागरिक (सार्वजनिक)',
  },
  'Researcher': {
    en: 'Researcher',
    hi: 'शोधकर्ता',
  },
  'Official': {
    en: 'Official',
    hi: 'शासकीय अधिकारी',
  },
  'Institution Admin': {
    en: 'Institution Admin',
    hi: 'संस्थान व्यवस्थापक',
  },
  'Super Admin': {
    en: 'Super Admin',
    hi: 'सुपर व्यवस्थापक',
  },

  // Access Control & Pages
  'Access Restricted': {
    en: 'Access Restricted',
    hi: 'पहुंच प्रतिबंधित',
  },
  'Access control': {
    en: 'Access control',
    hi: 'पहुंच नियंत्रण',
  },
  'Insufficient Permissions': {
    en: 'Insufficient Permissions',
    hi: 'अपर्याप्त अनुमतियां',
  },
  'Sign In Required': {
    en: 'Sign In Required',
    hi: 'साइन इन आवश्यक है',
  },
  'Return to Overview': {
    en: 'Return to Overview',
    hi: 'अवलोकन पर लौटें',
  },
  'Sign In to Continue': {
    en: 'Sign In to Continue',
    hi: 'जारी रखने के लिए साइन इन करें',
  },
  'Research Synthesis': {
    en: 'Research Synthesis',
    hi: 'अनुसंधान संश्लेषण',
  },

  // Platform Admin Console & Management
  'Platform Admin Console': {
    en: 'Platform Admin Console',
    hi: 'मंच व्यवस्थापक कंसोल (Admin Console)',
  },
  'System Administration / Security': {
    en: 'System Administration / Security',
    hi: 'सिस्टम प्रशासन एवं सुरक्षा नियंत्रण',
  },
  'Manage user accounts, check audit logs, review data verification queues, and monitor system health.': {
    en: 'Manage user accounts, check audit logs, review data verification queues, and monitor system health.',
    hi: 'उपयोगकर्ता खातों का प्रबंधन करें, ऑडिट लॉग जांचें, डेटा सत्यापन की समीक्षा करें और सिस्टम स्वास्थ्य की निगरानी करें।',
  },
  'Admin Mode Active': {
    en: 'Admin Mode Active',
    hi: 'प्रशासक मोड सक्रिय (Admin Mode Active)',
  },
  'Changes made here directly affect user accounts and system configuration. Please proceed with care.': {
    en: 'Changes made here directly affect user accounts and system configuration. Please proceed with care.',
    hi: 'यहाँ किए गए परिवर्तन सीधे उपयोगकर्ता खातों और सिस्टम कॉन्फ़िगरेशन को प्रभावित करते हैं। कृपया सावधानी से आगे बढ़ें।',
  },
  'Total Users': {
    en: 'Total Users',
    hi: 'कुल उपयोगकर्ता',
  },
  'Live DB Synced': {
    en: 'Live DB Synced',
    hi: 'लाइव डेटाबेस सिंक',
  },
  'Repository Docs': {
    en: 'Repository Docs',
    hi: 'भंडार दस्तावेज़',
  },
  'pgvector indexed': {
    en: 'pgvector indexed',
    hi: 'वेक्टर अनुक्रमित',
  },
  'Active workspaces': {
    en: 'Active workspaces',
    hi: 'सक्रिय कार्यक्षेत्र',
  },
  'Districts Monitored': {
    en: 'Districts Monitored',
    hi: 'निगरानी अधीन जिले',
  },
  'Pan-India Census 2011': {
    en: 'Pan-India Census 2011',
    hi: 'अखिल भारतीय जनगणना 2011',
  },
  'Active ML Models': {
    en: 'Active ML Models',
    hi: 'सक्रिय एमएल मॉडल',
  },
  'Risk, Value, Title': {
    en: 'Risk, Value, Title',
    hi: 'जोखिम, मूल्यांकन, स्वामित्व',
  },
  'User Accounts Management': {
    en: 'User Accounts Management',
    hi: 'उपयोगकर्ता खाता प्रबंधन',
  },
  'Search by name or email...': {
    en: 'Search by name or email...',
    hi: 'नाम या ईमेल द्वारा खोजें...',
  },
  'All Roles': {
    en: 'All Roles',
    hi: 'सभी भूमिकाएं',
  },
  'User': {
    en: 'User',
    hi: 'उपयोगकर्ता',
  },
  'Role': {
    en: 'Role',
    hi: 'भूमिका',
  },
  'Status': {
    en: 'Status',
    hi: 'स्थिति',
  },
  'Actions': {
    en: 'Actions',
    hi: 'कार्रवाइयां',
  },
  'Loading users...': {
    en: 'Loading users...',
    hi: 'उपयोगकर्ता लोड हो रहे हैं...',
  },
  'No users found matching your filters.': {
    en: 'No users found matching your filters.',
    hi: 'आपके फ़िल्टर से मेल खाता कोई उपयोगकर्ता नहीं मिला।',
  },
  'Active': {
    en: 'Active',
    hi: 'सक्रिय',
  },
  'Suspended': {
    en: 'Suspended',
    hi: 'निलंबित',
  },
  'Suspend User': {
    en: 'Suspend User',
    hi: 'उपयोगकर्ता निलंबित करें',
  },
  'Reactivate User': {
    en: 'Reactivate User',
    hi: 'उपयोगकर्ता पुनः सक्रिय करें',
  },
  'Activity & Audit Logs': {
    en: 'Activity & Audit Logs',
    hi: 'गतिविधि एवं सुरक्षा ऑडिट लॉग',
  },
  'Timestamp': {
    en: 'Timestamp',
    hi: 'समय (Timestamp)',
  },
  'User ID': {
    en: 'User ID',
    hi: 'उपयोगकर्ता आईडी',
  },
  'Action': {
    en: 'Action',
    hi: 'कार्रवाई',
  },
  'Details': {
    en: 'Details',
    hi: 'विवरण',
  },
  'Loading audit logs...': {
    en: 'Loading audit logs...',
    hi: 'ऑडिट लॉग लोड हो रहे हैं...',
  },
  'No audit logs found.': {
    en: 'No audit logs found.',
    hi: 'कोई ऑडिट लॉग नहीं मिला।',
  },
  'System & Server Health': {
    en: 'System & Server Health',
    hi: 'सिस्टम एवं सर्वर स्वास्थ्य',
  },
  'Operational': {
    en: 'Operational',
    hi: 'सक्रिय / चालू',
  },
  'Conn Pool': {
    en: 'Conn Pool',
    hi: 'कनेक्शन पूल',
  },
  'DB Latency': {
    en: 'DB Latency',
    hi: 'डेटाबेस लेटेंसी',
  },
  'Vector Search (pgvector)': {
    en: 'Vector Search (pgvector)',
    hi: 'वेक्टर खोज (pgvector)',
  },
  'Index State': {
    en: 'Index State',
    hi: 'इंडेक्स स्थिति',
  },
  'Synchronized': {
    en: 'Synchronized',
    hi: 'सिंक्रनाइज़्ड',
  },
  'p95 Latency': {
    en: 'p95 Latency',
    hi: 'p95 लेटेंसी',
  },
  'ML Inference Engine': {
    en: 'ML Inference Engine',
    hi: 'एमएल इंफरेंस इंजन',
  },
  'Models Online': {
    en: 'Models Online',
    hi: 'ऑनलाइन मॉडल',
  },
  'Latency (p95)': {
    en: 'Latency (p95)',
    hi: 'विलंबता (p95)',
  },
  'Models': {
    en: 'Models',
    hi: 'मॉडल',
  },

  // Landing Page Hero
  'hero_badge': {
    en: 'National Digital Platform for Land Governance · SIH PS 26019',
    hi: 'भूमि शासन के लिए राष्ट्रीय डिजिटल मंच · एसआईएच पीएस 26019',
  },
  'hero_ministry': {
    en: 'भारत सरकार · ग्रामीण विकास मंत्रालय · भू-संसाधन विभाग (DoLR)',
    hi: 'भारत सरकार · ग्रामीण विकास मंत्रालय · भू-संसाधन विभाग (DoLR)',
  },
  'hero_title': {
    en: "India's Digital Platform for Land Records & Policy Intelligence",
    hi: 'भूमि अभिलेख एवं नीतिगत विश्लेषण के लिए भारत का राष्ट्रीय डिजिटल मंच',
  },
  'hero_sub': {
    en: 'Helping government officials, researchers, and citizens access accurate land maps, verified policy documents, and AI-powered insights across 640 Indian districts.',
    hi: '640 भारतीय जिलों में सटीक भू-मानचित्र, सत्यापित नीति दस्तावेज़ और एआई-संचालित अंतर्दृष्टि तक शासकीय अधिकारियों, शोधकर्ताओं और नागरिकों की आसान पहुंच।',
  },
  'hero_search_placeholder': {
    en: 'Search for land policies, schemes, or districts (e.g. SVAMITVA, Maharashtra)',
    hi: 'भूमि नीतियों, योजनाओं या जिलों को खोजें (उदा. स्वामित्व, महाराष्ट्र)',
  },
  'search_registry': {
    en: 'Search Registry',
    hi: 'रजिस्ट्री खोजें',
  },
  'explore_maps': {
    en: 'Explore Land Maps',
    hi: 'भू-मानचित्र देखें',
  },
  'browse_docs': {
    en: 'Browse Documents',
    hi: 'दस्तावेज़ ब्राउज़ करें',
  },
  'ask_ai': {
    en: 'Ask AI Assistant',
    hi: 'एआई सहायक से पूछें',
  },

  // Stats
  'stat_districts': {
    en: 'Indian Districts Profiled',
    hi: 'चिह्नित भारतीय जिले',
  },
  'stat_villages': {
    en: 'Revenue Villages Covered',
    hi: 'शामिल राजस्व गांव',
  },
  'stat_digitized': {
    en: 'Land Records Digitized',
    hi: 'डिजिटल भू-अभिलेख',
  },
  'stat_accuracy': {
    en: 'Drone Survey Accuracy',
    hi: 'ड्रोन सर्वेक्षण सटीकता',
  },
  'stat_cards': {
    en: 'SVAMITVA Property Cards',
    hi: 'स्वामित्व संपत्ति कार्ड',
  },

  // Schemes Section
  'key_schemes_kicker': {
    en: 'Key Government Schemes',
    hi: 'प्रमुख सरकारी योजनाएं',
  },
  'key_schemes_title': {
    en: 'National Land Reform Programmes & Initiatives',
    hi: 'राष्ट्रीय भूमि सुधार कार्यक्रम एवं पहलें',
  },
  'key_schemes_sub': {
    en: 'Explore the major government schemes and laws that shape land governance across India.',
    hi: 'भारत भर में भूमि शासन को आकार देने वाली प्रमुख सरकारी योजनाओं और कानूनों का अन्वेषण करें।',
  },
  'view_all_docs': {
    en: 'View all 400+ documents',
    hi: 'सभी 400+ दस्तावेज़ देखें',
  },
  'read_more': {
    en: 'Read More',
    hi: 'और पढ़ें',
  },

  // Tools Section
  'tools_kicker': {
    en: 'What This Platform Offers',
    hi: 'इस मंच की प्रमुख सुविधाएं',
  },
  'tools_title': {
    en: 'Six Tools to Simplify Land Governance',
    hi: 'भूमि शासन को सरल बनाने वाले छह प्रमुख उपकरण',
  },
  'tools_sub': {
    en: 'Browse land maps, search verified government documents, ask AI for policy answers, compare policies, simulate scenarios, and collaborate on ideas.',
    hi: 'भू-मानचित्र देखें, सत्यापित सरकारी दस्तावेज़ खोजें, एआई से नीतिगत उत्तर पाएं, नीतियों की तुलना करें और विचारों पर सहयोग करें।',
  },
  'get_started': {
    en: 'Get Started',
    hi: 'शुरू करें',
  },

  // Featured Districts
  'featured_districts_kicker': {
    en: 'Featured Districts',
    hi: 'प्रमुख जिले',
  },
  'featured_districts_title': {
    en: 'District Land Records Progress',
    hi: 'जिला भू-अभिलेख डिजिटलीकरण प्रगति',
  },
  'featured_districts_sub': {
    en: 'See how different districts are progressing with digital land records, survey coverage, and risk assessments.',
    hi: 'देखें कि विभिन्न जिले डिजिटल भूमि रिकॉर्ड, सर्वेक्षण और जोखिम आकलन में किस प्रकार प्रगति कर रहे हैं।',
  },
  'open_full_map': {
    en: 'Open Full Map',
    hi: 'संपूर्ण मानचित्र खोलें',
  },
  'digitization_progress': {
    en: 'Digitization Progress',
    hi: 'डिजिटलीकरण प्रगति',
  },
  'revenue_villages': {
    en: 'Revenue Villages',
    hi: 'राजस्व गांव',
  },
  'view_gazette_records': {
    en: 'View Gazette Records',
    hi: 'राजपत्र अभिलेख देखें',
  },

  // Role Banner
  'roles_kicker': {
    en: 'Different User Roles',
    hi: 'विभिन्न उपयोगकर्ता भूमिकाएं',
  },
  'roles_title': {
    en: 'A Customized View for Every User',
    hi: 'प्रत्येक उपयोगकर्ता के लिए अनुकूलित अनुभव',
  },
  'roles_sub': {
    en: 'The platform adapts its capabilities based on your verified role and credentials — from public citizens and researchers to revenue department officials.',
    hi: 'यह मंच आपकी सत्यापित भूमिका और साख के आधार पर अपनी क्षमताओं को अनुकूलित करता है - आम नागरिकों और शोधकर्ताओं से लेकर राजस्व अधिकारियों तक।',
  },
  'ready_explore': {
    en: 'Ready to start exploring?',
    hi: 'क्या आप अन्वेषण शुरू करने के लिए तैयार हैं?',
  },
  'ready_explore_sub': {
    en: 'Start browsing verified land records or explore the interactive map right away.',
    hi: 'सत्यापित भूमि रिकॉर्ड ब्राउज़ करना शुरू करें या तुरंत इंटरैक्टिव मानचित्र देखें।',
  },
  'open_land_map': {
    en: 'Open Land Map',
    hi: 'भू-मानचित्र खोलें',
  },
  'citizen_access_title': {
    en: 'Open Citizen & Public Access',
    hi: 'खुला नागरिक एवं सार्वजनिक प्रवेश',
  },

  // Footer
  'footer_title': {
    en: 'National Digital Platform for Land Governance (SIH PS 26019)',
    hi: 'राष्ट्रीय डिजिटल भूमि शासन मंच (एसआईएच पीएस 26019)',
  },
  'footer_sub': {
    en: 'Department of Land Resources (DoLR), Ministry of Rural Development · Government of India',
    hi: 'भू-संसाधन विभाग (DoLR), ग्रामीण विकास मंत्रालय · भारत सरकार',
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'nlgp_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const item = translations[key];
    if (item && item[language]) {
      return item[language];
    }
    return fallback ?? key;
  };

  const isHindi = language === 'hi';

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isHindi,
      t,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

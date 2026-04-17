export type Locale = 'en' | 'fr' | 'es';

export const locales: Locale[] = ['en', 'fr', 'es'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    nav_who: 'Who We Are',
    nav_how: 'How It Works',
    nav_pricing: 'Pricing',
    nav_faq: 'FAQ',
    nav_safety: 'Safety & Trust',
    nav_contact: 'Contact',
    nav_schools: 'For Schools',
    nav_login: 'Sign In',
    nav_signup: 'Get Started',

    // Hero
    hero_badge: 'Now launching — early access open',
    hero_title_1: 'Find the mentor',
    hero_title_2: "who's been",
    hero_title_hl: 'exactly',
    hero_title_3: 'where you want to go',
    hero_sub: 'GrowVia matches ambitious students and young professionals with experienced mentors through AI — in minutes, not months.',
    hero_find: 'Find my mentor',
    hero_become: 'Become a mentor',
    trust_one2one: 'One-to-one mentoring',
    trust_verified: 'Verified mentors',
    trust_ai: 'AI Smart Matching',
    hero_card_discovery: 'Discovery Session',
    hero_card_price: '9.99€ · 15–20 min',
    hero_card_mentors: 'Mentors welcome',
    hero_card_join: 'Apply to join',

    // Categories
    cat_label: 'What we cover',
    cat_title: 'Explore mentoring categories',
    cat_sub: 'GrowVia supports people at every stage — from students choosing their path to professionals seeking a new direction.',
    cat_students: 'Students',
    cat_students_desc: 'Helping students choose their future path, academic specialization, and university direction with guidance from experienced mentors.',
    cat_career: 'Career',
    cat_career_desc: "Navigate career transitions, discover your path, and land your dream job with someone who's done it.",
    cat_business: 'Business',
    cat_business_desc: 'Start, scale, and grow your professional or entrepreneurial journey with proven guidance.',
    cat_growth: 'Personal Growth',
    cat_growth_desc: 'Build confidence, clarity, and unlock your full potential with a mentor who understands the journey.',
    cat_accepting: 'Accepting mentors now',

    // Mentor value
    mentor_badge: 'For mentors',
    mentor_title_1: 'Turn your experience into',
    mentor_title_hl: "someone's breakthrough",
    mentor_sub: 'Your career took years to build. GrowVia lets you turn that expertise into real impact — on your schedule, with zero overhead.',
    mentor_b1_title: 'Lead generation on autopilot',
    mentor_b1_desc: 'Qualified mentees come to you — no cold outreach, no self-promotion. GrowVia brings the right people to your profile.',
    mentor_b2_title: 'Zero admin',
    mentor_b2_desc: 'GrowVia handles scheduling, payments, and session tracking. You focus entirely on the mentee in front of you.',
    mentor_b3_title: 'Your legacy, structured',
    mentor_b3_desc: 'Track mentee progress over time and earn your Certified Mentor badge — a mark of trust visible to every mentee on the platform.',
    mentor_apply: 'Apply to become a mentor',
    mentor_apply_sub: 'Manual review · Earn your Certified Mentor badge',

    // Community
    community_label: 'Our community',
    community_title: 'Meet our mentors',
    community_sub: 'We are currently onboarding our first cohort of verified mentors.',
    community_apply_link: 'Apply as a mentor',
    community_slot_career: 'Career & Leadership',
    community_slot_entrepreneur: 'Entrepreneurship',
    community_slot_personal: 'Personal Development',
    community_slot_student: 'Student Guidance',
    community_slot_coming: 'Mentor profile coming soon',
    community_slot_reviewing: 'We are reviewing applications',
    community_expert: 'Are you an expert in your field?',
    community_apply_text: 'Apply to become a mentor →',

    // Success CTA
    success_badge: 'We are just getting started',
    success_title: 'Be our first success story',
    success_sub: 'GrowVia is launching now. We are onboarding our first mentors and mentees. Sign up today and help shape the platform — your story could be the one that inspires thousands.',
    success_cta_find: 'Find my mentor',
    success_cta_apply: 'Apply as a mentor',

    // Final CTA
    final_badge: 'Where careers are built.',
    final_title: 'Ready to accelerate your success?',
    final_sub: 'GrowVia is open for early access. Sign up now, get AI-matched with your first mentor, and start with a Discovery Session at just 9.99€.',
    final_cta_find: 'Find my mentor',
    final_cta_learn: 'Learn more',
    final_footnote: 'No commitment required · Free to browse · Discovery Session from 9.99€',

    footer_tagline: 'Bringing clarity to your future.',
  },

  fr: {
    // Nav
    nav_who: 'Qui Sommes-Nous',
    nav_how: 'Comment Ça Marche',
    nav_pricing: 'Tarifs',
    nav_faq: 'FAQ',
    nav_safety: 'Sécurité & Confiance',
    nav_contact: 'Contact',
    nav_schools: 'Pour les Écoles',
    nav_login: 'Se connecter',
    nav_signup: 'Commencer',

    // Hero
    hero_badge: 'Lancement en cours — accès anticipé ouvert',
    hero_title_1: 'Trouvez le mentor',
    hero_title_2: 'qui a',
    hero_title_hl: 'exactement',
    hero_title_3: 'vécu votre parcours',
    hero_sub: "GrowVia met en relation des étudiants ambitieux et de jeunes professionnels avec des mentors expérimentés grâce à l'IA — en quelques minutes, pas en plusieurs mois.",
    hero_find: 'Trouver mon mentor',
    hero_become: 'Devenir mentor',
    trust_one2one: 'Mentorat individuel',
    trust_verified: 'Mentors vérifiés',
    trust_ai: 'Matching IA intelligent',
    hero_card_discovery: 'Session Découverte',
    hero_card_price: '9,99€ · 15–20 min',
    hero_card_mentors: 'Mentors bienvenus',
    hero_card_join: 'Postuler',

    // Categories
    cat_label: 'Ce que nous couvrons',
    cat_title: 'Explorer les catégories de mentorat',
    cat_sub: "GrowVia accompagne les personnes à chaque étape — des étudiants qui choisissent leur voie aux professionnels en reconversion.",
    cat_students: 'Étudiants',
    cat_students_desc: "Aider les étudiants à choisir leur voie, leur spécialisation académique et leur orientation universitaire avec des mentors expérimentés.",
    cat_career: 'Carrière',
    cat_career_desc: "Naviguez dans les transitions de carrière, découvrez votre voie et décrochez l'emploi de vos rêves avec quelqu'un qui l'a fait.",
    cat_business: 'Business',
    cat_business_desc: "Lancez, développez et faites croître votre parcours professionnel ou entrepreneurial avec des conseils éprouvés.",
    cat_growth: 'Développement Personnel',
    cat_growth_desc: "Renforcez votre confiance, votre clarté et libérez tout votre potentiel avec un mentor qui comprend le chemin.",
    cat_accepting: 'Accepte des mentors maintenant',

    // Mentor value
    mentor_badge: 'Pour les mentors',
    mentor_title_1: 'Transformez votre expérience en',
    mentor_title_hl: 'avancée décisive',
    mentor_sub: "Votre carrière a pris des années à construire. GrowVia vous permet de transformer cette expertise en impact réel — à votre rythme, sans aucune charge administrative.",
    mentor_b1_title: 'Génération de leads en automatique',
    mentor_b1_desc: "Des mentorés qualifiés viennent à vous — sans démarchage, sans autopromotion. GrowVia amène les bonnes personnes à votre profil.",
    mentor_b2_title: 'Zéro administration',
    mentor_b2_desc: "GrowVia gère la planification, les paiements et le suivi des sessions. Vous vous concentrez entièrement sur votre mentoré.",
    mentor_b3_title: 'Votre héritage, structuré',
    mentor_b3_desc: "Suivez la progression de vos mentorés dans le temps et obtenez votre badge Mentor Certifié — un signe de confiance visible par tous les mentorés de la plateforme.",
    mentor_apply: 'Postuler pour devenir mentor',
    mentor_apply_sub: 'Révision manuelle · Obtenez votre badge Mentor Certifié',

    // Community
    community_label: 'Notre communauté',
    community_title: 'Rencontrez nos mentors',
    community_sub: 'Nous intégrons actuellement notre première cohorte de mentors vérifiés.',
    community_apply_link: 'Postuler comme mentor',
    community_slot_career: 'Carrière & Leadership',
    community_slot_entrepreneur: 'Entrepreneuriat',
    community_slot_personal: 'Développement Personnel',
    community_slot_student: 'Orientation Étudiante',
    community_slot_coming: 'Profil mentor bientôt disponible',
    community_slot_reviewing: 'Nous examinons les candidatures',
    community_expert: 'Êtes-vous un expert dans votre domaine ?',
    community_apply_text: 'Postuler pour devenir mentor →',

    // Success CTA
    success_badge: 'Nous ne faisons que commencer',
    success_title: 'Soyez notre première success story',
    success_sub: "GrowVia se lance maintenant. Nous intégrons nos premiers mentors et mentorés. Inscrivez-vous aujourd'hui et aidez à façonner la plateforme — votre histoire pourrait en inspirer des milliers.",
    success_cta_find: 'Trouver mon mentor',
    success_cta_apply: 'Postuler comme mentor',

    // Final CTA
    final_badge: 'Là où les carrières se construisent.',
    final_title: 'Prêt à accélérer votre succès ?',
    final_sub: "GrowVia est ouvert en accès anticipé. Inscrivez-vous maintenant, soyez mis en relation avec votre premier mentor par IA, et commencez avec une Session Découverte à seulement 9,99€.",
    final_cta_find: 'Trouver mon mentor',
    final_cta_learn: 'En savoir plus',
    final_footnote: "Sans engagement · Gratuit pour naviguer · Session Découverte à partir de 9,99€",

    footer_tagline: 'Apporter de la clarté à votre avenir.',
  },

  es: {
    nav_who: 'Quiénes Somos',
    nav_how: 'Cómo Funciona',
    nav_pricing: 'Precios',
    nav_faq: 'Preguntas',
    nav_safety: 'Seguridad y Confianza',
    nav_contact: 'Contacto',
    nav_schools: 'Para Escuelas',
    nav_login: 'Iniciar Sesión',
    nav_signup: 'Empezar',
    hero_title: 'Crece con mentores que realmente entienden tu camino',
    hero_sub: 'Conecta con profesionales experimentados para tomar mejores decisiones de carrera.',
    hero_find: 'Encontrar Mentor',
    hero_become: 'Ser Mentor',
    trust_verified: 'Mentores Verificados',
    trust_sessions: 'Sesiones Individuales',
    trust_ai: 'Matching IA Inteligente',
    footer_tagline: 'Trayendo claridad a tu futuro.',
  },
};

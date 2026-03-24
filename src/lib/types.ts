export interface SDK {
  name: string;
  url: string;
  lang: string;
}

export interface Rating {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ApiPackage {
  js: string;
  python: string;
  note: string;
}

export interface Api {
  id: string;
  name: string;
  pkg: ApiPackage;
  description: string;
  longDesc: string;
  category: string;
  rating: number;
  ratingCount: number;
  difficulty: number;
  pricing: 'free' | 'freemium' | 'pay-per-use';
  authType: string;
  docsUrl: string;
  views: number;
  trending: boolean;
  sdks: SDK[];
  ratings: Rating[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export type Language = 'javascript' | 'python' | 'curl';

export type SortOption = 'trending' | 'rating' | 'name' | 'difficulty';

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export type PricingFilter = 'all' | 'free' | 'freemium' | 'pay-per-use';

import { Profile } from './profile.model';

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface ArticleResponse {
  article: Article;
}

export interface MultipleArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface ArticleListConfig {
  type: 'all' | 'feed';
  filters: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}

export interface CreateArticle {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export type UpdateArticle = Partial<CreateArticle>;

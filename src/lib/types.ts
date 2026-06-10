export interface Tag {
  name: string;
  url: string;
  watched?: boolean;
  ignored?: boolean;
}

export interface Author {
  id: number;
  name: string;
  avatar?: string;
  profileUrl: string;
  reputation: number;
  gold?: number;
  silver?: number;
  bronze?: number;
}

export interface Question {
  id: number;
  title: string;
  url: string;
  excerpt: string;
  votes: number;
  answers: number;
  views: number;
  tags: Tag[];
  author: Author;
  askedAt: string;
  askedAtRelative: string;
  acceptedAnswer?: boolean;
  watched?: boolean;
  state?: 'archived' | 'closed' | 'draft' | 'deleted' | 'pinned' | 'review';
  bounty?: number;
}

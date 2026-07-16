import { NoticeCategory, NoticeAudience } from '../../generated/prisma';

export interface INotice {
  title: string;
  content: string;
  category?: NoticeCategory;
  audience?: NoticeAudience;
  date?: Date;
  author: string;
}

export interface INoticeFilters {
  searchTerm?: string;
  category?: NoticeCategory;
  audience?: NoticeAudience;
}



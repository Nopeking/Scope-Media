export interface LiveStream {
  id: string;
  title: string;
  url: string;
  status: string;
  thumbnail: string;
  viewers?: number;
}

export interface ArchivedVideo {
  id: string;
  title: string;
  url: string;
  duration: string;
  uploadDate: string;
  customTitle: string;
  thumbnail: string;
}

export interface RecentVideo {
  id: string;
  title: string;
  url: string;
  uploadDate: string;
  thumbnail: string;
}

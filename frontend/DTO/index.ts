export interface PaginatedPosts {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  Post[];
}


export interface Post {
  id:         number;
  content:    string;
  created_at: Date;
  like_count: number;
  owner:      User["username"];
  is_liked: boolean
}


export interface User {
  id:              number;
  username:        string;
  follower_count:  number;
  following_count: number;
}

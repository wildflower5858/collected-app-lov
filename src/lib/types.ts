export interface Driver {
  id: string;
  name: string;
  collection_type: string;
  team: string | null;
  color_hex: string;
  avatar_type: string;
  avatar_value: string | null;
  sort_order: number;
  created_at: string;
  card_count?: number;
}

export interface Card {
  id: string;
  driver_id: string;
  year: number;
  set_name: string;
  card_number: string | null;
  card_name: string | null;
  parallel: string;
  copy_number: string | null;
  print_run: string | null;
  card_type: string;
  team: string | null;
  status: string;
  image_front_url: string | null;
  image_back_url: string | null;
  is_graded: boolean;
  grading_company: string | null;
  grade: string | null;
  cert_number: string | null;
  notes: string | null;
  sort_order: number;
  is_landscape: boolean;
  created_at: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
}

export type CollectionType = 'f1' | 'kpop' | 'pokemon';
export type CardStatus = 'owned' | 'purchased' | 'wishlist';
export type ViewMode = 'binder' | 'list' | 'sort';

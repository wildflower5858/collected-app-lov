export interface Person {
  id: string;
  name: string;
  collection_type: string;
  group_id: string | null;
  team: string | null;
  color_hex: string;
  avatar_type: string;
  avatar_value: string | null;
  sort_order: number;
  created_at: string;
  card_count?: number;
}

export type Driver = Person;

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

export interface F1Driver {
  id: string;
  name: string;
  created_at: string;
  card_count?: number;
}

export interface F1Card {
  id: string;
  card_name: string | null;
  card_number: string | null;
  driver_id: string;
  set_id: string | null;
  parallel_id: string | null;
  type: string;
  status: string;
  copy_number: string | null;
  print_run: string | null;
  graded: boolean;
  grade_company: string | null;
  grade: string | null;
  cert_number: string | null;
  notes: string | null;
  image_front: string | null;
  image_back: string | null;
  sort_order: number;
  created_at: string;
  // joined fields
  set_name?: string;
  parallel_name?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  collection_type: string;
  sort_order: number;
}

export type CollectionType = 'f1' | 'kpop' | 'pokemon';
export type CardStatus = 'owned' | 'purchased' | 'wishlist';
export type ViewMode = 'binder' | 'scroll';

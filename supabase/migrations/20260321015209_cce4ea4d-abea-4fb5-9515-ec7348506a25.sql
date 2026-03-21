
-- Reference list: sets
CREATE TABLE public.sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sets are viewable by everyone" ON public.sets FOR SELECT USING (true);
CREATE POLICY "Sets can be inserted by anyone" ON public.sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Sets can be updated by anyone" ON public.sets FOR UPDATE USING (true);
CREATE POLICY "Sets can be deleted by anyone" ON public.sets FOR DELETE USING (true);

-- Reference list: parallels
CREATE TABLE public.parallels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.parallels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parallels are viewable by everyone" ON public.parallels FOR SELECT USING (true);
CREATE POLICY "Parallels can be inserted by anyone" ON public.parallels FOR INSERT WITH CHECK (true);
CREATE POLICY "Parallels can be updated by anyone" ON public.parallels FOR UPDATE USING (true);
CREATE POLICY "Parallels can be deleted by anyone" ON public.parallels FOR DELETE USING (true);

-- Reference list: card_types
CREATE TABLE public.card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.card_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Card types are viewable by everyone" ON public.card_types FOR SELECT USING (true);
CREATE POLICY "Card types can be inserted by anyone" ON public.card_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Card types can be updated by anyone" ON public.card_types FOR UPDATE USING (true);
CREATE POLICY "Card types can be deleted by anyone" ON public.card_types FOR DELETE USING (true);

-- Drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  collection_type TEXT NOT NULL DEFAULT 'f1',
  team TEXT,
  color_hex TEXT NOT NULL DEFAULT '#888888',
  avatar_type TEXT NOT NULL DEFAULT 'initials',
  avatar_value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers are viewable by everyone" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers can be inserted by anyone" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Drivers can be updated by anyone" ON public.drivers FOR UPDATE USING (true);
CREATE POLICY "Drivers can be deleted by anyone" ON public.drivers FOR DELETE USING (true);

-- Cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  set_name TEXT NOT NULL,
  card_number TEXT,
  card_name TEXT,
  parallel TEXT NOT NULL DEFAULT 'Base',
  copy_number TEXT,
  print_run TEXT,
  card_type TEXT NOT NULL DEFAULT 'Base',
  team TEXT,
  status TEXT NOT NULL DEFAULT 'owned',
  image_front_url TEXT,
  image_back_url TEXT,
  is_graded BOOLEAN NOT NULL DEFAULT false,
  grading_company TEXT,
  grade TEXT,
  cert_number TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_landscape BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, year, set_name, card_number, parallel)
);
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards are viewable by everyone" ON public.cards FOR SELECT USING (true);
CREATE POLICY "Cards can be inserted by anyone" ON public.cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Cards can be updated by anyone" ON public.cards FOR UPDATE USING (true);
CREATE POLICY "Cards can be deleted by anyone" ON public.cards FOR DELETE USING (true);

-- Storage bucket for card images
INSERT INTO storage.buckets (id, name, public) VALUES ('card-images', 'card-images', true);
CREATE POLICY "Card images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'card-images');
CREATE POLICY "Anyone can upload card images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'card-images');
CREATE POLICY "Anyone can update card images" ON storage.objects FOR UPDATE USING (bucket_id = 'card-images');
CREATE POLICY "Anyone can delete card images" ON storage.objects FOR DELETE USING (bucket_id = 'card-images');

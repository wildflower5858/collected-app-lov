
-- K-pop groups
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups select" ON public.groups FOR SELECT USING (true);
CREATE POLICY "groups insert" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "groups update" ON public.groups FOR UPDATE USING (true);
CREATE POLICY "groups delete" ON public.groups FOR DELETE USING (true);

-- K-pop binders
CREATE TABLE public.binders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.binders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "binders select" ON public.binders FOR SELECT USING (true);
CREATE POLICY "binders insert" ON public.binders FOR INSERT WITH CHECK (true);
CREATE POLICY "binders update" ON public.binders FOR UPDATE USING (true);
CREATE POLICY "binders delete" ON public.binders FOR DELETE USING (true);

-- K-pop cards
CREATE TABLE public.kpop_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name text,
  card_number text,
  binder_id uuid NOT NULL REFERENCES public.binders(id) ON DELETE CASCADE,
  set_id uuid REFERENCES public.sets(id),
  parallel_id uuid REFERENCES public.parallels(id),
  type text NOT NULL DEFAULT 'Base',
  status text NOT NULL DEFAULT 'owned',
  copy_number text,
  print_run text,
  graded boolean NOT NULL DEFAULT false,
  grade_company text,
  grade text,
  cert_number text,
  notes text,
  image_front text,
  image_back text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.kpop_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kpop_cards select" ON public.kpop_cards FOR SELECT USING (true);
CREATE POLICY "kpop_cards insert" ON public.kpop_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "kpop_cards update" ON public.kpop_cards FOR UPDATE USING (true);
CREATE POLICY "kpop_cards delete" ON public.kpop_cards FOR DELETE USING (true);

-- Pokémon cards
CREATE TABLE public.pokemon_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name text,
  card_number text,
  set_id uuid REFERENCES public.sets(id),
  parallel_id uuid REFERENCES public.parallels(id),
  type text NOT NULL DEFAULT 'Base',
  status text NOT NULL DEFAULT 'owned',
  copy_number text,
  print_run text,
  graded boolean NOT NULL DEFAULT false,
  grade_company text,
  grade text,
  cert_number text,
  notes text,
  image_front text,
  image_back text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.pokemon_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pokemon_cards select" ON public.pokemon_cards FOR SELECT USING (true);
CREATE POLICY "pokemon_cards insert" ON public.pokemon_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "pokemon_cards update" ON public.pokemon_cards FOR UPDATE USING (true);
CREATE POLICY "pokemon_cards delete" ON public.pokemon_cards FOR DELETE USING (true);

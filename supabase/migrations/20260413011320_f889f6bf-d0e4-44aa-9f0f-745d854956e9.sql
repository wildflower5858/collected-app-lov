
CREATE TABLE public.f1_drivers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.f1_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.f1_parallels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.f1_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name text,
  card_number text,
  driver_id uuid NOT NULL REFERENCES public.f1_drivers(id) ON DELETE CASCADE,
  set_id uuid REFERENCES public.f1_sets(id),
  parallel_id uuid REFERENCES public.f1_parallels(id),
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

ALTER TABLE public.f1_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_parallels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_drivers select" ON public.f1_drivers FOR SELECT USING (true);
CREATE POLICY "f1_drivers insert" ON public.f1_drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "f1_drivers update" ON public.f1_drivers FOR UPDATE USING (true);
CREATE POLICY "f1_drivers delete" ON public.f1_drivers FOR DELETE USING (true);

CREATE POLICY "f1_sets select" ON public.f1_sets FOR SELECT USING (true);
CREATE POLICY "f1_sets insert" ON public.f1_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "f1_sets update" ON public.f1_sets FOR UPDATE USING (true);
CREATE POLICY "f1_sets delete" ON public.f1_sets FOR DELETE USING (true);

CREATE POLICY "f1_parallels select" ON public.f1_parallels FOR SELECT USING (true);
CREATE POLICY "f1_parallels insert" ON public.f1_parallels FOR INSERT WITH CHECK (true);
CREATE POLICY "f1_parallels update" ON public.f1_parallels FOR UPDATE USING (true);
CREATE POLICY "f1_parallels delete" ON public.f1_parallels FOR DELETE USING (true);

CREATE POLICY "f1_cards select" ON public.f1_cards FOR SELECT USING (true);
CREATE POLICY "f1_cards insert" ON public.f1_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "f1_cards update" ON public.f1_cards FOR UPDATE USING (true);
CREATE POLICY "f1_cards delete" ON public.f1_cards FOR DELETE USING (true);

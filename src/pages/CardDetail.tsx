import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import type { Card, Person } from "@/lib/types";
import { useState } from "react";
import EditCardDialog from "@/components/EditCardDialog";
import ParallelBadge from "@/components/ParallelBadge";

export default function CardDetail() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBack, setShowBack] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: card } = useQuery({
    queryKey: ["card", cardId],
    queryFn: async () => {
      const { data } = await supabase.from("cards").select("*").eq("id", cardId!).single();
      return data as Card;
    },
  });

  const { data: person } = useQuery({
    queryKey: ["card-person", card?.person_id],
    enabled: !!card?.person_id,
    queryFn: async () => {
      const { data } = await supabase.from("persons").select("*").eq("id", card!.person_id).single();
      return data as Person;
    },
  });

  if (!card || !person) return null;

  const imageUrl = showBack ? card.image_back_url : card.image_front_url;
  const hasBackImage = !!card.image_back_url;

  const fieldRows: { label: string; value: string | null }[] = [
    { label: "Parallel", value: card.parallel },
    ...(card.copy_number || card.print_run ? [{ label:

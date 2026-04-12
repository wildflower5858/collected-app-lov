import { useNavigate } from "react-router-dom";
import type { Card, Person } from "@/lib/types";

interface Props {
  cards: Card[];
  person: Person;
}

export default function BinderView({ cards, person }: Props) {
  const navigate = useNavigate();

  const grouped: { label: string; cards: Card[] }[] = [];
  const bySet: Record<string, Card[]> = {};

  cards.forEach((card) => {
    const key = `${card.set_name} ${card.year}`;
    if (!bySet[key]) bySet[key] = [];
    bySet[key].push(card);
  });

  Object.entries(bySet).forEach(([label, setCards]) => {
    for (let i = 0; i < setCards.length; i += 9) {
      grouped.push({ label, cards: setCards.slice(i, i + 9) });
    }
  });

  if (grouped.length === 0 && cards.length > 0) {
    for (let i = 0; i < cards.length; i += 9) {
      grouped.push({ label: "All Cards", cards: cards.slice(i, i + 9) });
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-body text-muted-foreground py-12 text-center">
        No cards yet. Add your first card to start building your collection.
      </div>
    );
  }

  const pillStyle: React.CSSProperties = {
    backgroundColor: "rgba(10,10,10,0.6)",
    color: "white",
    fontSize: "9px",
    padding: "2px 4px",
    borderRadius: "3px",

import { useNavigate } from "react-router-dom";

export default function PokemonShelfPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-12 py-5 border-b border-border">
        <img src="/logo.svg" alt="collected" className="h-7" />
        <div className="flex-1 mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full max-w-md bg-secondary rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-foreground/30"
          />
        </div>
        <div className="w-[34px]" />
      </header>

      <div className="px-12 py-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Collections
        </button>

        <h1 className="text-page-title text-foreground mb-8">Pokémon</h1>

        <div className="grid grid-cols-4 gap-6">
          <button
            onClick={() => navigate("/pokemon/cards")}
            className="text-left"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3">
              <img
                src="/binders/pokemon/pokemon.svg"
                alt="Pokémon"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="text-section-title text-foreground">Pokémon</div>
          </button>
        </div>
      </div>
    </div>
  );
}

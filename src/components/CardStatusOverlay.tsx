interface Props {
  status: string;
  hasImage: boolean;
}

export default function CardStatusOverlay({ status, hasImage }: Props) {
  if (status === "owned" && hasImage) return null;

  if (!hasImage) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded">
        <span className="text-[12px] text-muted-foreground">No Image</span>
      </div>
    );
  }

  if (status === "purchased") {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded"
        style={{ backgroundColor: "rgba(180,0,0,0.45)" }}>
        <span className="text-[11px] font-medium text-card tracking-wide">Purchased</span>
      </div>
    );
  }

  if (status === "wishlist") {
    return (
      <>
        <div className="absolute inset-0 rounded" style={{ filter: "grayscale(1)", opacity: 0.5 }} />
        <div className="absolute inset-0 flex items-center justify-center rounded">
          <span className="text-[11px] font-medium text-card tracking-wide">Wishlist</span>
        </div>
      </>
    );
  }

  return null;
}

type ComicCardProps = {
  title: string;
  author: string;
  description?: string;
  onClick: () => void;
};

export function ComicCard({
  title,
  author,
  description,
  onClick,
}: ComicCardProps) {
  return (
    <button className="comic-card" onClick={onClick}>
      <strong>{title}</strong>
      <span>{author}</span>
      {description && (
        <span className="comic-card-description">{description}</span>
      )}
    </button>
  );
}

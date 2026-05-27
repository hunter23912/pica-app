type ComicCardProps = {
  title: string;
  author: string;
  onClick: () => void;
};

export function ComicCard({ title, author, onClick }: ComicCardProps) {
  return (
    <button className="comic-card" onClick={onClick}>
      <strong>{title}</strong>
      <span>{author}</span>
    </button>
  );
}

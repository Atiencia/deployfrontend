// src/components/StoryCard.tsx
interface StoryCardProps {
  date: string;
  title: string;
  desc: string;
}

export default function StoryCard({ date, title, desc }: StoryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <p className="text-xs text-gray-500">{date}</p>
      <h3 className="font-semibold text-gray-800 mt-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
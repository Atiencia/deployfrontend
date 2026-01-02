// src/components/SecretaryCard.tsx
interface SecretaryCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function SecretaryCard({ title, description, icon, onClick }: SecretaryCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer flex items-center gap-4"
    >
      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
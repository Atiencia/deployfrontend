import { MapPinIcon } from "@heroicons/react/24/solid";

interface PinIconProps {
  className?: string;
}

const PinIcon = ({ className = "w-4 h-4" }: PinIconProps) => {
  return <MapPinIcon className={`${className} text-red-600`} />;
};

export default PinIcon;
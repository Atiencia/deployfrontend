import type { Event } from "../data/eventsData";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className="list-none"
    >
      <Link
        to={`/eventos/${event.id}`}
        className="flex items-start p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
        />

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {event.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {event.description}
          </p>
        </div>
      </Link>
    </motion.li>
  );
}
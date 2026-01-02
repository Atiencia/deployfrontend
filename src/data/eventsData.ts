
export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  group: string;
  date: string;
  type: string;
}

export const events: Event[] = [
  {
    id: "campamento-im",
    title: "Campamento IM",
    description:
      "Carpa? Check. Marshmallows? Check. Un amigo? Casi que casi. Inscríbete al campamento y dile a tus amigos.",
    image: "src/assets/evento1.jpg",
    group: "Instituto Misionero",
    date: "2025-09-12",
    type: "Evento",
  },
  {
    id: "exposalud-st",
    title: "ExpoSalud Santo Tome",
    description:
      "Los 8 remedios naturales haciendo presencia mi llave en la provincia vecina.",
    image: "src/assets/evento2.png",
    group: "ExpoSalud",
    date: "2025-09-05",
    type: "Salida",
  },
  {
    id: "all-day-jabes",
    title: "ALL-DAY con JABES!",
    description:
      "Acompáñanos a Ramirez este sábado y sé parte de nuestro equipaso.",
    image: "src/assets/evento3.png",
    group: "JABES",
    date: "2025-09-14",
    type: "Salida",
  },
];
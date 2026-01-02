import { useState, useEffect } from 'react';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Versiculo {
  texto: string;
  referencia: string;
  tema: 'amor' | 'perdón' | 'salvación' | 'oración' | 'felicidad';
}

const versiculos: Versiculo[] = [
  // AMOR
  {
    texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.",
    referencia: "Juan 3:16",
    tema: "amor"
  },
  {
    texto: "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece.",
    referencia: "1 Corintios 13:4",
    tema: "amor"
  },
  {
    texto: "Y nosotros hemos conocido y creído el amor que Dios tiene para con nosotros. Dios es amor; y el que permanece en amor, permanece en Dios, y Dios en él.",
    referencia: "1 Juan 4:16",
    tema: "amor"
  },
  {
    texto: "El amor nunca deja de ser.",
    referencia: "1 Corintios 13:8",
    tema: "amor"
  },
  {
    texto: "Amémonos unos a otros, porque el amor es de Dios. Todo aquel que ama, es nacido de Dios y conoce a Dios.",
    referencia: "1 Juan 4:7",
    tema: "amor"
  },
  
  // PERDÓN
  {
    texto: "Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados, y limpiarnos de toda maldad.",
    referencia: "1 Juan 1:9",
    tema: "perdón"
  },
  {
    texto: "Antes sed benignos unos con otros, misericordiosos, perdonándoos unos a otros, como Dios también os perdonó a vosotros en Cristo.",
    referencia: "Efesios 4:32",
    tema: "perdón"
  },
  {
    texto: "Porque si perdonáis a los hombres sus ofensas, os perdonará también a vosotros vuestro Padre celestial.",
    referencia: "Mateo 6:14",
    tema: "perdón"
  },
  {
    texto: "Cuanto está lejos el oriente del occidente, hizo alejar de nosotros nuestras rebeliones.",
    referencia: "Salmos 103:12",
    tema: "perdón"
  },
  {
    texto: "Entonces Pedro se acercó y le dijo: Señor, ¿cuántas veces perdonaré a mi hermano que peque contra mí? ¿Hasta siete? Jesús le dijo: No te digo hasta siete, sino aun hasta setenta veces siete.",
    referencia: "Mateo 18:21-22",
    tema: "perdón"
  },

  // SALVACIÓN
  {
    texto: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.",
    referencia: "Efesios 2:8",
    tema: "salvación"
  },
  {
    texto: "Que si confesares con tu boca que Jesús es el Señor, y creyeres en tu corazón que Dios le levantó de los muertos, serás salvo.",
    referencia: "Romanos 10:9",
    tema: "salvación"
  },
  {
    texto: "Y en ningún otro hay salvación; porque no hay otro nombre bajo el cielo, dado a los hombres, en que podamos ser salvos.",
    referencia: "Hechos 4:12",
    tema: "salvación"
  },
  {
    texto: "Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.",
    referencia: "Romanos 6:23",
    tema: "salvación"
  },
  {
    texto: "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él.",
    referencia: "Juan 3:17",
    tema: "salvación"
  },

  // ORACIÓN
  {
    texto: "Orad sin cesar.",
    referencia: "1 Tesalonicenses 5:17",
    tema: "oración"
  },
  {
    texto: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.",
    referencia: "Mateo 7:7",
    tema: "oración"
  },
  {
    texto: "Y todo lo que pidiereis en oración, creyendo, lo recibiréis.",
    referencia: "Mateo 21:22",
    tema: "oración"
  },
  {
    texto: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.",
    referencia: "Filipenses 4:6",
    tema: "oración"
  },
  {
    texto: "La oración eficaz del justo puede mucho.",
    referencia: "Santiago 5:16",
    tema: "oración"
  },

  // FELICIDAD
  {
    texto: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.",
    referencia: "Salmos 118:24",
    tema: "felicidad"
  },
  {
    texto: "El gozo de Jehová es vuestra fuerza.",
    referencia: "Nehemías 8:10",
    tema: "felicidad"
  },
  {
    texto: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!",
    referencia: "Filipenses 4:4",
    tema: "felicidad"
  },
  {
    texto: "Bienaventurados los de limpio corazón, porque ellos verán a Dios.",
    referencia: "Mateo 5:8",
    tema: "felicidad"
  },
  {
    texto: "Estos cosas os he hablado, para que mi gozo esté en vosotros, y vuestro gozo sea cumplido.",
    referencia: "Juan 15:11",
    tema: "felicidad"
  }
];

const temaConfig = {
  amor: { color: 'bg-red-50 border-red-200', icon: '❤️', iconColor: 'text-red-600' },
  perdón: { color: 'bg-purple-50 border-purple-200', icon: '🕊️', iconColor: 'text-purple-600' },
  salvación: { color: 'bg-blue-50 border-blue-200', icon: '✝️', iconColor: 'text-blue-600' },
  oración: { color: 'bg-green-50 border-green-200', icon: '🙏', iconColor: 'text-green-600' },
  felicidad: { color: 'bg-yellow-50 border-yellow-200', icon: '😊', iconColor: 'text-yellow-600' }
};

export default function VersiculoDiario() {
  const [versiculoDelDia, setVersiculoDelDia] = useState<Versiculo | null>(null);

  useEffect(() => {
    // Obtener versículo del día basado en la fecha
    const obtenerVersiculoDelDia = () => {
      const hoy = new Date();
      const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
      const indice = seed % versiculos.length;
      return versiculos[indice];
    };

    setVersiculoDelDia(obtenerVersiculoDelDia());
  }, []);

  if (!versiculoDelDia) return null;

  const config = temaConfig[versiculoDelDia.tema];

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg border-2 ${config.color} p-8 mb-8 transition-all hover:shadow-xl`}>
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpenIcon className={`w-8 h-8 ${config.iconColor}`} />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Versículo del Día</h3>
              <p className="text-sm text-gray-600 capitalize">Tema: {versiculoDelDia.tema}</p>
            </div>
          </div>
          <span className="text-4xl animate-pulse">{config.icon}</span>
        </div>

        {/* Versículo */}
        <div className="mb-6">
          <blockquote className="relative">
            <SparklesIcon className={`w-8 h-8 ${config.iconColor} opacity-30 absolute -top-2 -left-2`} />
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 italic pl-6 pr-6">
              "{versiculoDelDia.texto}"
            </p>
          </blockquote>
        </div>

        {/* Referencia */}
        <div className="flex items-center justify-end">
          <div className={`px-4 py-2 ${config.iconColor} bg-white rounded-lg shadow-sm`}>
            <p className="font-semibold text-sm">— {versiculoDelDia.referencia}</p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
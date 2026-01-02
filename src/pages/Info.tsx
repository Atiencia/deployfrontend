// src/pages/Info.tsx
import { useNavigate } from "react-router-dom";

export default function Info() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-red-100 flex flex-col items-center px-4 py-10">
      {/* HERO */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-red-700 mb-2 drop-shadow-lg">
          Instituto Misionero{" "}
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-4">
          Servimos porque Él nos sirvió primero.
        </p>
        <div className="bg-white/80 rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-4 border border-red-100">
          <span className="text-2xl md:text-3xl font-bold text-black mb-2 block">
            “Somos llamados a servir como Jesús sirvió”
          </span>
          <blockquote className="italic text-gray-700 mt-2">
            “Y recorrió Jesús todas las ciudades y aldeas, enseñando en las
            sinagogas de ellos, y predicando el evangelio del reino, y sanando
            toda enfermedad y toda dolencia en el pueblo.”
            <br />
            <span className="block mt-2 font-semibold text-black">
              — Mateo 9:35
            </span>
          </blockquote>
        </div>
        <p className="text-gray-700 max-w-2xl mx-auto mt-4">
          El mundo necesita esperanza. En cada comunidad hay corazones que buscan
          amor y verdad. Estamos llamados a salir al encuentro de esas
          necesidades, siguiendo el ejemplo de Jesús: enseñar, ayudar y acompañar.
        </p>
      </section>

      {/* JESUS EJEMPLO */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-red-50 to-white p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-red-700 mb-3">
            El ejemplo de Jesús
          </h2>
          <p className="text-gray-700 mb-2">
            Jesús no se limitó a predicar desde los templos. Caminaba entre la
            gente, ayudaba a los necesitados, y acompañaba a quienes lo buscaban.
            Su vida es un modelo de servicio integral, donde el amor se demuestra
            con acciones.
          </p>
        </div>
      </section>

      {/* LLAMADO BIBLICO */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-black mb-3">
            💬 El llamado misionero en la Biblia
          </h2>
          <ul className="space-y-4 text-gray-700">
            <li>
              <span className="font-semibold text-black-200">
                “Id por todo el mundo y predicad el evangelio a toda criatura.”
              </span>
              <br />
              <span className="text-gray-700">— Marcos 16:15</span>
            </li>
            <li>
              <span className="font-semibold text-black-200">
                “Así alumbre vuestra luz delante de los hombres, para que vean
                vuestras buenas obras, y glorifiquen a vuestro Padre que está en
                los cielos.”
              </span>
              <br />
              <span className="text-gray-700">— Mateo 5:16</span>
            </li>
            <li>
              <span className="font-semibold text-black-200">
                “El Espíritu del Señor está sobre mí, por cuanto me ha enviado
                para dar buenas nuevas a los necesitados.”
              </span>
              <br />
              <span className="text-gray-700">— Lucas 4:18</span>
            </li>
          </ul>
          <p className="mt-4 text-gray-700">
            Cada persona puede ser luz donde está: en la escuela, en el trabajo,
            en el barrio. Los grupos misioneros son una forma práctica de
            demostrar la fe y el amor.
          </p>
        </div>
      </section>

      {/* CONSEJO ESPIRITU DE PROFECIA */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-white to-red-50 p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-black mb-3">
            ✨ Inspiración para servir
          </h2>
          <ul className="space-y-4 text-gray-700">
            <li>
              <span className="italic">
               “El Salvador pasó más tiempo sanando a los enfermos que predicando. Su obra de curación revelaba su amor por los hombres. 
               Los pobres, los enfermos, los ignorantes y los oprimidos recibían de Él la atención más tierna. A todos decía: Venid a mí.”
              </span>
              <br />
              <span className="font-semibold text-black">— Elena G. de White, El Ministerio de Curación, p. 17.</span>
            </li>
            <li>
              <span className="italic">
                “Cristo confió a su iglesia la obra de llevar la salvación al mundo. Y para llevar a cabo esta obra, la iglesia debe cooperar con el cielo. 
                Los miembros deben ser colaboradores con Dios en la salvación de sus semejantes.”
              </span>
              <br />
              <span className="font-semibold text-black">— Elena G. de White, Los Hechos de los Apóstoles, p. 76.</span>
            </li>
            <li>
              <span className="italic">
                “Se necesitan misioneros —hombres y mujeres que lleven el amor de Cristo a las ciudades y pueblos, que enseñen a los niños, 
                que visiten a los enfermos y consuelen a los ancianos.”
              </span>
              <br />
              <span className="font-semibold text-black">— Elena G. de White, Servicio Cristiano, p. 9.</span>
            </li>
            <li>
              <span className="italic">
                “El verdadero misionero se identifica con las necesidades de la gente. No trabaja para ser visto, sino para salvar. 
                Lleva alivio donde hay dolor, educación donde hay ignorancia, esperanza donde hay oscuridad.”
              </span>
              <br />
              <span className="font-semibold text-black">— Elena G. de White, Ministerio de la Bondad, p. 12.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* EJEMPLO PRIMEROS CRISTIANOS */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-red-700 mb-3">
            El ejemplo de los primeros cristianos
          </h2>
          <blockquote className="text-gray-700 italic mb-2">
            “Y compartían lo que tenían, ayudando a todos según la necesidad de
            cada uno.”
            <br />
            <span className="font-semibold text-black">— Hechos 2:42,45</span>
          </blockquote>
          <p className="text-gray-700">
            Los primeros discípulos entendieron que la misión era un estilo de
            vida. Iban juntos, apoyándose, sirviendo y compartiendo. Hoy podemos
            revivir ese espíritu de servicio.
          </p>
        </div>
      </section>

      {/* MISION INTEGRAL */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-red-50 to-white p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-black mb-3">
            Educar, servir, amar: la misión integral
          </h2>
          <p className="text-gray-700 mb-4">
            Nuestro Instituto Misionero cree que servir es actuar. Por eso formamos
            y enviamos grupos misioneros que:
          </p>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-700 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-red-600 text-xl">📖</span> Ofrecen estudios
              bíblicos en hogares y comunidades.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 text-xl">👩‍🏫</span> Enseñan a los
              niños valores, educación y hábitos saludables.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 text-xl">👵</span> Acompañan a los
              mayores, llevando compañía y oración.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 text-xl">🍞</span> Realizan proyectos
              de ayuda comunitaria, distribuyendo alimentos y esperanza.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 text-xl">🌱</span> Desarrollan
              programas de salud y educación ambiental.
            </li>
          </ul>
          <blockquote className="mt-4 text-gray-800 italic">
            “En cada obra de misericordia, en cada palabra de amor, Cristo se manifiesta al mundo.”
            <br />
            <span className="font-semibold text-black">— Elena G. de White, El Deseado de Todas las Gentes, p. 350.</span>
          </blockquote>
        </div>
      </section>

      {/* LLAMADO FINAL */}
      <section className="mb-10 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-semibold text-black mb-3">
            Un llamado a servir
          </h2>
          <p className="text-gray-700 mb-2">
            No esperes a sentirte completamente preparado para ayudar. Todos
            podemos ser reflejo de amor y esperanza en nuestro entorno.
          </p>
          <blockquote className="text-gray-700 italic mb-2">
            “Entonces oí la voz del Señor, que decía: ¿A quién enviaré, y quién
            irá por nosotros? Y respondí yo: Heme aquí, envíame a mí.”
            <br />
            <span className="font-semibold text-black">— Isaías 6:8</span>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mb-10">
        <h3 className="text-2xl font-semibold text-black mb-3">
          🌿 Únete a la misión
        </h3>
        <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
          Si deseas vivir una experiencia real de fe, ayudar a otros y crecer
          espiritualmente, este es tu momento. Ven y forma parte de un movimiento
          que busca transformación y servicio.
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="/register"
            className="px-5 py-3 bg-red-700 text-white rounded shadow hover:bg-red-800 transition"
          >
            Registrarse
          </a>
          <a
            href="/contact"
            className="px-5 py-3 border border-red-700 text-red-700 rounded shadow hover:bg-red-100 transition"
          >
            Contactar
          </a>
        </div>
      </section>

      <button
        className="mt-4 px-6 py-3 bg-white border border-red-700 text-red-700 rounded-md shadow hover:bg-red-100 transition"
        onClick={() => navigate("/")}
      >
        Volver al inicio
      </button>
    </main>
  );
}
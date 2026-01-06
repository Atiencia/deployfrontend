import Sidebar from "./Sidebar"
import { GruposItem } from "./GruposListUser"
import { useGrupos } from "../queries/gruposQueries"
import LoadingSpinner from "./LoadingComponents";


export default function GruposListViewer() {
    const { data: grupos, error, isLoading } = useGrupos()

    if (error) return <p className="p-6 text-red-600 text-center">{error.message}</p>;
    if (isLoading) return (
        <div className="min-h-screen flex bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-56">
                <main className="pt-10 px-8 flex-1 flex justify-center items-center">
                    <LoadingSpinner size="lg" message="Cargando grupos..." />
                </main>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 md:ml-56 p-4 md:p-8 pt-20 md:pt-8">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center md:text-left">
                            Nuestros grupos misioneros
                        </h2>

                        {grupos && grupos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {grupos.map((g) => <GruposItem grupo={g} key={g.id_grupo} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 col-span-2">Los grupos a los que sigas apareceran aca!</p>
                        )}
                    </div>
                </main >
            </div >
        </>

    )

}

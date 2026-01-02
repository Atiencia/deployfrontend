import { useAtomValue } from "jotai"
import { LoadingSpinner, ErrorState } from "../components/LoadingComponents"
import Sidebar from "../components/Sidebar"
import { GruposItem } from "../pages/GrupoUser"
import { useMisGruposSecretaria } from "../queries/secretariaGrupoQueries"
import { userRolAtom } from "../store/jotaiStore"


export default function GrupoSecGrupal() {
    const rolUsuario = useAtomValue(userRolAtom)
    const {data: infoSecretaria, isLoading: loading, error} = useMisGruposSecretaria(rolUsuario)

    // Mostrar loading mientras se cargan los datos
    if (loading) {
        return (
            <div className="min-h-screen flex bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-56">
                    <main className="pt-10 px-8 flex-1 flex justify-center items-center">
                        <LoadingSpinner size="lg" message="Cargando grupos..." />
                    </main>
                </div>
            </div>
        );
    }

    // Mostrar error si hay problemas cargando eventos
    if (error) {
        return (
            <div className="min-h-screen flex bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-56">
                    <main className="pt-10 px-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Eventos</h1>
                        <ErrorState
                            message={error.message}
                            onRetry={() => window.location.reload()}
                        />
                    </main>
                </div>
            </div>
        );
    }


    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-56 p-8">
                    <div className="max-w-6xl mx-auto p-5">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 ">
                            Mis grupos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {infoSecretaria?.grupos && infoSecretaria.grupos?.length > 0 ? (
                                infoSecretaria.grupos.map((g) => <GruposItem grupo={g} key={g.id_grupo} />)
                            ) : (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-center">
                                    <p className="text-yellow-800">
                                        ⚠️ No tienes grupos asignados. Contacta al administrador.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
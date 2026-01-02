export function NoAutorizado(){
    return (
        <div className="bg-red-50 flex items-center justify-center h-screen">

            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center border border-red-100">

                <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9.172 16.172a4 4 0 015.656 0M15 9h.01M9 9h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-6xl font-bold text-red-700">403</h1>
                <p className="text-xl font-semibold text-red-700 mt-2 mb-6">Acceso Prohibido</p>
                <p className="text-gray-600 mt-2">
                    No estas autorizado para acceder a esta pagina.
                </p>

                <div className="mt-10">
                    <a href="/" className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition duration-200">
                        Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    )
}
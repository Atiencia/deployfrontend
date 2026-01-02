import GruposListAdmin from "../components/GruposListAdmin"
import GruposListUser from "../components/GruposListUser"
import { useAtomValue } from "jotai"
import { userRolAtom } from "../store/jotaiStore"
import GrupoSecGrupal from "../components/GruposListSecGrupal"
import GruposListViewer from "../components/GruposListViewer"
// import { NoAutorizado } from "./NoAutorizado"

export default function GruposList() {
    const rolUsuario = useAtomValue(userRolAtom)

    if(!rolUsuario){
        return <GruposListViewer/>
    }

    // Si es usuario normal (rol 3), mostrar vista de usuario sin botones de administración
    if (rolUsuario === 3) {
        return <GruposListUser />
    }

    if(rolUsuario === 5){
        return <GrupoSecGrupal />
    }

    // Para administradores (rol 1, 2) y secretarias (rol 4), mostrar vista de admin con botones
    return <GruposListAdmin />
}
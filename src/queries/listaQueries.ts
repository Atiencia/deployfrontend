import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { asignarRolAUsuario, fetchRolesService, fetchUsuariosService, loginService, logoutService, obtenerRol, registerService, verificarListaDisponible } from "../Services/listaService";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { userRolAtom } from "../store/jotaiStore";
import { toast } from "sonner";
import { clearAuthData } from "../utils/authUtils";

export function useVerificarListaDisponible(grupoId: number, eventoId: number) {
    return useQuery({
        queryKey: ['listaDisponible'],
        queryFn: () => verificarListaDisponible(grupoId, eventoId)
    })
}

export function useRoles() {
    return useQuery({
        queryKey: ['roles'],
        queryFn: fetchRolesService,
    })
}

export function useAsignarRol() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: asignarRolAUsuario,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['usuarios'] })
            // No mostramos toast aquí, se mostrará desde el componente
        },
        onError: (error) => {
            toast.error('Error al asignar rol', { description: error.message })
        }
    })
}

export function useUsuarios() {
    return useQuery({
        queryKey: ['usuarios'],
        queryFn: fetchUsuariosService
    })
}

export function useRolLogueado() {
    return useQuery({
        queryKey: ['usuarios', 'id'],
        queryFn: obtenerRol
    })
}

export function useLogout() {
    const qc = useQueryClient();
    const setUserRol = useSetAtom(userRolAtom);

    return useMutation({
        mutationFn: async () => {
            // Limpiar INMEDIATAMENTE antes de hacer la petición al servidor
            clearAuthData();
            setUserRol(0);
            qc.clear();
            
            try {
                // Intentar hacer logout en servidor
                await logoutService();
            } catch (error) {
                // Si falla (por ejemplo, token inválido), continuar de todos modos
                console.warn('Error al hacer logout en servidor, limpiando de todos modos:', error);
            }
        },
        onSuccess: () => {
            // Redirección directa a login
            window.location.href = '/login';
        },
        onError: (error) => {
            // Incluso si hay error, asegurarse de limpiar y redirigir
            console.error('Error en la mutación de logout:', error.message);
            clearAuthData();
            setUserRol(0);
            qc.clear();
            window.location.href = '/login';
        }
    })
}

export function useRegister() {
    const navigate = useNavigate()

    return useMutation({
        mutationFn: registerService,
        onSuccess: async () => {
            toast.success("Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.", {
                duration: 6000
            });

            // Mostrar un mensaje adicional con información
            setTimeout(() => {
                toast.info("Revisa tu bandeja de entrada y la carpeta de spam para encontrar el correo de verificación.", {
                    duration: 5000
                });
            }, 1000);

            setTimeout(() => navigate("/login"), 5000);
        },
        onError: (error) => {
            console.error('Error en la mutación de logout:', error.message);
            toast.error(error.message || 'Ocurrio un error en el registro')
        }
    })
}

export function useLogin(options = {}) {
    return useMutation({
        mutationFn: loginService,
        ...options
    })
}
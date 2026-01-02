// Popover.tsx
import React, { useRef, useEffect, createContext, type ReactNode, useState, useContext } from "react";
// popoverStore.ts
import { createStore, useStore } from "zustand";

// interfaz del estado del componente
interface PopoverState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}


interface PopoverProps {
  triggerLabel: string;
  children: React.ReactNode;
}

// declaramos la funcion que crea el store del popover con sus funciones y variables
const createPopoverStore = () => {
  return createStore<PopoverState>((set) => ({
    isOpen: false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set({ isOpen: false }),
  }))
};

//definimos un contexto para nuestro store porque queremos scopearlo, que
// cada instancia del popover tenga sus propios datos
const popoverContext = createContext<ReturnType<typeof createPopoverStore> | null>(null)

//Declaramos la funcion que proveera el contexto a nuestro store
export default function PopoverStoreProvider({ children }: { children: ReactNode }) {
  const [popoverStore] = useState(createPopoverStore);
  return (
    <popoverContext.Provider value={popoverStore}>
      {children}
    </popoverContext.Provider>
  )
}

//Funcion que nos permitira usar el Store y sus funciones y/o atributos
function usePopoverStore<T>(selector: (state: PopoverState) => T) {
  const store = useContext(popoverContext)
  if (!store) throw new Error('se daño')
  return useStore(store, selector)
}

//Este sera el popover implementado como tal
export const PopoverInner: React.FC<PopoverProps> = ({ triggerLabel, children }) => {
  const isOpen = usePopoverStore((state) => state.isOpen);
  const toggle = usePopoverStore((state) => state.toggle);
  const close = usePopoverStore((state) => state.close)


  const popoverRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button onClick={toggle} className="p-2 border border-white rounded-md bg-white cursor-pointer hover:bg-gray-200 transition w-28 flex justify-center items-center gap-2">
        {triggerLabel}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[110%] left-0 bg-white border border-gray-300 rounded-md shadow-md p-2.5 min-w-[120px] z-10"
        >
          {children}
        </div>
      )}
    </div>
  );
};

//exportamos el popover implementado en conjunto con el proveedor de contexto
//para garantizar que el store este scopeado
export  const Popover: React.FC<PopoverProps> = (props) => (
  <PopoverStoreProvider>
    <PopoverInner {...props} />
  </PopoverStoreProvider>
)

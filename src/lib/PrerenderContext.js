import { createContext, useContext } from "react";

export const PrerenderContext = createContext(null);

export function usePrerenderData() {
  return useContext(PrerenderContext);
}

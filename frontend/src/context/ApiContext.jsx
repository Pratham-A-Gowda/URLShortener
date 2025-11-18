import React, { createContext, useContext } from 'react'
import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const ApiContext = createContext()

export function ApiProvider({ children }){
  const client = axios.create({ baseURL: API })
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
}
export const useApi = ()=> useContext(ApiContext)

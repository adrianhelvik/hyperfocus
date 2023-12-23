import { createContext, useContext } from 'react'
import Store from 'store'

const StoreContext = createContext<Store>(new Store())

export default StoreContext;
export const useStore = () => useContext(StoreContext)

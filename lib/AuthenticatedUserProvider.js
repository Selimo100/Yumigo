// Authenticated User Provider - Context Provider für Benutzer-Authentifizierung
import {createContext, useState} from "react"

export const AuthenticatedUserContext = createContext({})

export default function AuthenticatedUserProvider({children}) {
    const [user, setUser] = useState(null)

    return (
        <AuthenticatedUserContext.Provider value={{user, setUser}}>
            {children}
        </AuthenticatedUserContext.Provider>
    )
}
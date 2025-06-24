import { useState, useEffect, useContext } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebaseconfig"
import { AuthenticatedUserContext } from "./AuthenticatedUserProvider"

export default function useAuth() {
    const { user, setUser } = useContext(AuthenticatedUserContext)
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(
            auth,
            async (authenticatedUser) => {
                authenticatedUser ? setUser(authenticatedUser) : setUser(null)
                setIsLoading(false)
            }

        )
        return unsubscribeAuth
    }, [user])
    return { user, isLoading }
}
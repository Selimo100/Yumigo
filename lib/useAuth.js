import {useState, useEffect, useContext} from "react"
import {onAuthStateChanged} from "firebase/auth"
import {auth} from "./firebaseconfig"
import {AuthenticatedUserContext} from "./AuthenticatedUserProvider"
import {initializeUserProfile} from "../services/userService"

export default function useAuth() {
    const {user, setUser} = useContext(AuthenticatedUserContext)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(
            auth,
            async (authenticatedUser) => {
                if (authenticatedUser) {
                    try {

                        await initializeUserProfile(
                            authenticatedUser.uid,
                            authenticatedUser.email
                        );

                        await authenticatedUser.reload();

                    } catch (error) {
                    }
                    setUser(authenticatedUser);
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        )
        return unsubscribeAuth
    }, [])

    return {user, isLoading}
}
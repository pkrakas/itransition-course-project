import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function Auth({children}) {

    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    useEffect(() => {
        if(!user.isAuthenticated)
            navigate('/')
    }, [])

    if(!user.isAuthenticated)
        return null

    return (
        <>
            {children}
        </>
    )
    
}
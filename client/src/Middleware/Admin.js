import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function Admin({children}) {

    const user = useSelector(state => state.user)
    const navigate = useNavigate()
    
    useEffect(() => {
        if(!user.isAdmin) 
            navigate('/')
    }, [])

    if(!user.isAdmin) 
        return null

    return (
        <>
            {children}
        </>
    )
}
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../State/Slices/userSlice";

export default function OAuth2() {
    
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        dispatch(login(token))
        navigate('/')
    }, [searchParams])

    return null
}
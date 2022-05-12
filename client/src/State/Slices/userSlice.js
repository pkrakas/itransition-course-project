import { createSlice } from "@reduxjs/toolkit"
import jwtDecode from "jwt-decode"

const initialState = {
    isAuthenticated: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            const user = jwtDecode(action.payload).user
            localStorage.setItem('token', `Bearer ${action.payload}`)
            return {
                ...user,
                isAuthenticated: true
            }
        },
        logout: (state) => {
            return {
                isAuthenticated: false
            }            
        }
    }
})

export const { login, logout } = userSlice.actions

export default userSlice.reducer
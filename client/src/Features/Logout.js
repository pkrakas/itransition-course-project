import { logout } from "../State/Slices/userSlice"

export default (store) => {
    localStorage.removeItem('token')
    store.dispatch(logout())
}
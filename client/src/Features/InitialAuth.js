import { login } from "../State/Slices/userSlice";

export default (store) => {
    const token = localStorage.getItem('token')
    if(!token) return;
    store.dispatch(login(token.split(' ')[1]))
}
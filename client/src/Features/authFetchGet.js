import Logout from "./Logout"

const API_URL = process.env.REACT_APP_API_URL

export default async function(uri, store, navigate) {

    const res = await fetch(`${API_URL + uri}`, {
        method: 'GET',
        headers: {
            Authorization: localStorage.getItem('token'),
        }
    })

    if(res.status === 403) {
        Logout(store)
        navigate('/login')
        return;
    }

    return res

}
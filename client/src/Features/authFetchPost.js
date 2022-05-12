import Logout from "./Logout"

const API_URL = process.env.REACT_APP_API_URL

export default async function(uri, obj, store, navigate) {

    const res = await fetch(`${API_URL + uri}`, {
        method: 'POST',
        headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })

    if(res.status === 403) {
        Logout(store)
        navigate('/login')
        return;
    }

    return res

}
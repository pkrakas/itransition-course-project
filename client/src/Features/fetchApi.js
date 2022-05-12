const API_URL = process.env.REACT_APP_API_URL

export default async function(uri) {
    const res = await fetch(`${API_URL + uri}`)
    return res
}
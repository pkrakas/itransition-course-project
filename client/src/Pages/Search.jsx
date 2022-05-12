import { useEffect, useState } from "react"
import { Spinner, Stack } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import fetchApi from "../Features/fetchApi"

export default function Search() {

    const { t } = useTranslation()
    const { search } = useLocation()
    const query = new URLSearchParams(search)
    const searchTerm = query.get('term')
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        setItems([])
        async function fetchSearch() {
            const res = await fetchApi(`/items/search/${searchTerm}`)
            setItems(await res.json())
            setIsLoading(false)
        }

        fetchSearch()
    }, [searchTerm])

    return (<>
        <h3 className="mt-3 mb-3">{t('pages.search.results') + searchTerm}</h3>
        {isLoading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" role="status" />
            </div>
        )}
        <Stack>
            {items.map(item => <Link to={`/collections/${item.collectionId}/item/${item.id}`} key={item.id}>{item.id + ' ' + item.name}</Link>)}
        </Stack>
    </>)
}
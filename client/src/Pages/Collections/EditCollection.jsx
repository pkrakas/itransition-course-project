import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { useStore } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import CollectionEditMenu from "../../Components/Collections/CollectionEditMenu"
import authFetchPost from "../../Features/authFetchPost"
import fetchApi from "../../Features/fetchApi"

export default function EditCollection() {

    const { t } = useTranslation()
    const { collectionId } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [collection, setCollection] = useState()

    const store = useStore()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchCollection() {
            const res = await fetchApi(`/collections/${collectionId}`)
            setCollection((await res.json()).collection)
            setIsLoading(false)
        }
        fetchCollection()
    }, [])

    const onSubmit = async (obj) => {

        const res = await authFetchPost(`/collections/edit/${collectionId}`, obj, store, navigate)
        if (res.ok && res.status === 200) {
            navigate(`/collections/${collectionId}`)
        }
    }

    if(isLoading)
        return (<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" />
    </div>)

    return (
        <CollectionEditMenu onSubmit={onSubmit} cName={collection.name} cTopic={collection.topicId} cDescription={collection.description} cImage={collection.image}
            header={<h3 className="mb-3">{t('pages.collections.edit')}</h3>}/>
    )

}
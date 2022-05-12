import authFetchPost from "../../Features/authFetchPost";
import { useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import CollectionEditMenu from "../../Components/Collections/CollectionEditMenu";
import { useTranslation } from "react-i18next";


export default function NewCollection() {

    const { t } = useTranslation()
    const store = useStore()
    const navigate = useNavigate()

    const onSubmit = async (obj) => {

        const res = await authFetchPost('/collections/new', obj, store, navigate)
        if (res.ok && res.status === 200) {
            const { collectionId } = await res.json()
            navigate(`/collections/${collectionId}`)
        }
    }

    return (
        <CollectionEditMenu onSubmit={onSubmit} header={<h3 className="mb-3">{t('pages.collections.createNew')}</h3>} />
    )
}
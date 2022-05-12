import { useEffect, useState } from "react"
import { Button, Form, Spinner } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import authFetchGet from "../../../Features/authFetchGet"
import { useForm } from "react-hook-form"
import authFetchPost from "../../../Features/authFetchPost"
import { MultiSelect } from "react-multi-select-component"
import { useStore } from "react-redux"
import "./NewItem.css"

export default function NewItem() {

    const { collectionId } = useParams()
    const [customFields, setCustomFields] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [tags, setTags] = useState([])
    const [tagOptions, setTagOptions] = useState([])
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const store = useStore()

    useEffect(() => {
        async function fetchCustomFields() {
            const res = await authFetchGet(`/collections/${collectionId}/custom-fields`, store, navigate)
            const data = await res.json()
            const customFields = data.customFields.map(customField => {
                switch (customField.type) {
                    case 'INTEGER':
                        return { ...customField, type: 'number' }
                    case 'STRING':
                        return { ...customField, type: 'text' }
                    case 'TEXT':
                        return { ...customField, type: 'textarea' }
                    case 'BOOLEAN':
                        return { ...customField, type: 'checkbox' }
                    case 'DATE':
                        return { ...customField, type: 'date' }
                }
            })
            setCustomFields(customFields)
            fetchUserTags()
        }
        async function fetchUserTags() {
            const res = await authFetchGet('/items/user-tags')
            let data = await res.json()
            let uniqueData = new Set(data.map(tag => tag.name))
            uniqueData = Array.from(uniqueData)
            setTagOptions(uniqueData.map(tag => { return { label: tag, value: tag } }))

            setIsLoading(false)
        }

        fetchCustomFields()
    }, [])

    const onSubmit = async (data) => {

        Object.keys(data).map(key => {
            if (typeof data[key] === 'boolean')
                data[key] = data[key] ? 'true' : 'false'
        })

        const selectedTags = tags.map(tag => tag.value)

        data.tags = selectedTags

        const res = await authFetchPost(`/collections/${collectionId}/new-item`, data, store, navigate)
        if (res.ok && res.status === 200)
            navigate(`/collections/${collectionId}`)
    }

    if (isLoading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" role="status" />
            </div>
        )

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="mb-3">Add new item</h3>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" {...register('name')} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <MultiSelect
                        options={tagOptions}
                        value={tags}
                        onChange={setTags}
                        isCreatable
                    />
                </Form.Group>
                {customFields.map((field, index) => (
                    <Form.Group key={index} className="mb-3">
                        <Form.Label>{field.name}</Form.Label>
                        {field.type === 'textarea' && <Form.Control as='textarea' placeholder="Enter value" {...register(`customFields.${field.name}`)} />}
                        {field.type !== 'textarea' && <Form.Control type={field.type} className={field.type === 'checkbox' ? 'form-checkbox' : ''} placeholder="Enter value" {...register(`customFields.${field.name}`)} />}
                    </Form.Group>
                ))}
                <div style={{ textAlign: "center" }}>
                    <Button type="submit">Add item</Button>
                </div>
            </Form>
        </div>
    )
}
import { useEffect, useState } from "react"
import { Button, Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { MultiSelect } from "react-multi-select-component"
import { useStore } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import authFetchGet from "../../../Features/authFetchGet"
import authFetchPost from "../../../Features/authFetchPost"
import fetchApi from "../../../Features/fetchApi"
import "./NewItem.css"

export default function EditItem() {
    const { collectionId, itemId } = useParams()
    const [tags, setTags] = useState([])
    const [tagOptions, setTagOptions] = useState([])
    const [customFields, setCustomFields] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { register, handleSubmit, setValue, getValues } = useForm()
    const store = useStore()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchItem() {
            const res = await fetchApi(`/items/${itemId}`)
            const data = await res.json()
            const customFields = data.customFields.map(customField => {
                setValue(`customFields.${customField.name}`, customField.value)
                switch(customField.type) {
                    case 'INTEGER':
                        return { ...customField, type: 'number' }
                    case 'STRING':
                        return { ...customField, type: 'text' }
                    case 'TEXT':
                        return { ...customField, type: 'textarea' }
                    case 'BOOLEAN': {
                        setValue(`customFields.${customField.name}`, customField.value === 'true' ? true : false)
                        return { ...customField, type: 'checkbox' }
                    }
                    case 'DATE':
                        return { ...customField, type: 'date' }
                }
            })
            setCustomFields(customFields)
            setValue('name', data.name)
            
            await fetchUserTags(data.tags)
        }
        async function fetchUserTags(checkedTags) {
            const res = await authFetchGet('/items/user-tags')
            let data = await res.json()
            let uniqueData = new Set(data.map(tag => tag.name))
            uniqueData = Array.from(uniqueData)
            checkedTags = checkedTags.map(tag => tag.name)
            setTagOptions(uniqueData.map(tag => {return {label: tag, value: tag}}))

            const serializedTags = checkedTags.map(tag => { return {label: tag, value: tag}})
            setTags(serializedTags)
            setIsLoading(false)
        }

        fetchItem()
    }, [])

    
    const onSubmit = async (data) => {

        setIsLoading(true)
        Object.keys(data).map(key => {
            if(typeof data[key] === 'boolean')
                data[key] = data[key] ? 'true' : 'false'
        })

        const selectedTags = tags.map(tag => tag.value)
        
        data.tags = selectedTags
        data.customFields = getValues('customFields')
        const res = await authFetchPost(`/items/${collectionId}/update/${itemId}`, data, store, navigate)
        if(res.ok && res.status === 200)
            navigate(-1)
    }

    if(isLoading)
        return (<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" />
    </div>)

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh'}}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="mb-3">Edit item</h3>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" {...register('name')}/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <MultiSelect 
                        options={tagOptions}
                        value={tags}
                        onChange={setTags}
                        isCreatable
                        hasSelectAll={false}
                    />
                </Form.Group>
                {customFields.map((field, index) => (
                    <Form.Group key={index} className="mb-3">
                        <Form.Label>{field.name}</Form.Label>
                        {field.type === 'textarea' && <Form.Control as='textarea' placeholder="Enter value" {...register(`customFields.${field.name}`)}/>}
                        {field.type !== 'textarea' && <Form.Control type={field.type} className={field.type === 'checkbox' ? 'form-checkbox' : ''} placeholder="Enter value" {...register(`customFields.${field.name}`)}/>}
                    </Form.Group>
                ))}
                <div style={{textAlign: "center"}}>
                    <Button type="submit" variant="warning">Update item</Button>
                </div>
            </Form>
        </div>
    )

}
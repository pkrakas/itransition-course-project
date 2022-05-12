import React, { useState } from "react";
import { Button, Form, OverlayTrigger, Popover } from "react-bootstrap";
import { AiOutlineMinusSquare} from "react-icons/ai";
import './RemoveCustomFieldPopover.css'
import authFetchPost from '../../Features/authFetchPost'
import { useStore } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function RemoveCustomFieldPopover({ collectionId, customFields, removeCustomField }) {

    const store = useStore()
    const navigate = useNavigate()

    const [field, setField] = useState('0')

    const onSubmit = async (e) => {
        e.preventDefault()

        if (field === '0')
            return;

        const res = await authFetchPost(`/collections/${collectionId}/remove-custom-field`, {field}, store, navigate)

        if (res.ok && res.status === 200) {
            removeCustomField(field)
            document.body.click()
        }
    }

    const CustomPopover = (<Popover>
        <Popover.Header as="h3" style={{ backgroundColor: '#DC3545', color: 'white' }}>Remove custom field</Popover.Header>
        <Popover.Body className='d-flex'>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Select field to remove</Form.Label>
                    <Form.Select aria-label="Default select example" onChange={(e) => setField(e.target.value)}>
                        <option value="0">Select field</option>
                        {customFields.map(field => <option value={field.name} key={field.name}>{field.name}</option>)}
                    </Form.Select>
                </Form.Group><div className="d-flex justify-content-center">
                    <Button type="submit" variant="danger">Remove field</Button>
                </div>
            </Form>
        </Popover.Body>
    </Popover>)


    return (
        <OverlayTrigger
            trigger='click'
            placement='bottom'
            rootClose
            overlay={CustomPopover}>
            <AiOutlineMinusSquare size={25} className="overlay-trigger-button-red" />
        </OverlayTrigger>
    )
}
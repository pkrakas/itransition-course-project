import React, { useRef, useState } from "react";
import { Button, Form, OverlayTrigger, Popover } from "react-bootstrap";
import { AiOutlinePlusSquare } from "react-icons/ai";
import './AddCustomFieldPopover.css'
import authFetchPost from '../../Features/authFetchPost'
import { useStore } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function AddCustomFieldPopover({ collectionId, addCustomField, columns}) {

    const store = useStore()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [fieldType, setFieldType] = useState('0')
    
    const onSubmit = async (e) => {
        e.preventDefault()

        if(!name.length || fieldType === '0') 
            return;
        
        const res = await authFetchPost(`/collections/${collectionId}/new-custom-field`, {name, fieldType}, store, navigate)
        
        if(res.ok && res.status === 200){
            addCustomField({
                dataField: name,
                text: name
            })
            document.body.click()
        }
    }

    const CustomPopover = (<Popover>
        <Popover.Header as="h3" style={{backgroundColor: '#0D6EFD', color: 'white'}}>Add custom field</Popover.Header>
        <Popover.Body className='d-flex'>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Custom field name" onChange={(e) => setName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Field Type</Form.Label>
                    <Form.Select aria-label="Default select example" onChange={(e) => setFieldType(e.target.value)}>
                        <option value="0">Select field type</option>
                        <option value="INTEGER">Integer</option>
                        <option value="STRING">String</option>
                        <option value="TEXT">Text</option>
                        <option value="BOOLEAN">Boolean</option>
                        <option value="DATE">Date</option>
                    </Form.Select>
                </Form.Group><div className="d-flex justify-content-center">
                    <Button type="submit">Add field</Button>
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
            <AiOutlinePlusSquare size={25} className="overlay-trigger-button"/>
        </OverlayTrigger>
    )
}
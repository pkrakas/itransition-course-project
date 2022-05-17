import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import fetchApi from "../../Features/fetchApi";
import authFetchDelete from '../../Features/authFetchDelete'
import ReactMarkdown from 'react-markdown'
import urls from "../../Constants/urls";
import { FcAddRow } from 'react-icons/fc'
import { FaRegEdit } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import filterFactory, { textFilter, numberFilter } from 'react-bootstrap-table2-filter'
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import AddCustomFieldPopover from "../../Components/Collections/AddCustomFieldPopover";
import { useSelector, useStore } from "react-redux";
import { useTranslation } from "react-i18next";
import RemoveCustomFieldPopover from "../../Components/Collections/RemoveCustomFieldPopover";

const defaultColumns = [
    {
        dataField: 'id',
        text: 'Id',
        sort: true,
        // filter: numberFilter()
    }, {
        dataField: 'name',
        text: 'Name',
        sort: true,
        sortFunc: ((a, b, order) => order === 'desc' ?
            a.props.children.localeCompare(b.props.children) :
            b.props.children.localeCompare(a.props.children)),
        csvFormatter: field => field.props.children,
        
        // filter: textFilter()
    }, {
        dataField: 'tags',
        text: 'Tags',
        sort: true,
        // filter: textFilter()
    }
]

export default function Collection() {

    const { collectionId } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const store = useStore()
    const [collection, setCollection] = useState({})
    const [columns, setColumns] = useState([])
    const [items, setItems] = useState([])
    const [customFields, setCustomFields] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const user = useSelector(state => state.user)

    const addCustomField = (customFieldObj) => {
        const c = [...columns]
        c.splice(c.length, 0, customFieldObj)
        setColumns(c)
    }

    const removeCustomField = customFieldStr => {
        setColumns(columns.filter(column => column.text !== customFieldStr))
        setCustomFields(old => old.filter(field => field.name !== customFieldStr))
    }

    const handleDeleteItem = async (itemId) => {
        const res = await authFetchDelete(`/items/${collectionId}/${itemId}`)
        if (res.ok && res.status === 200) {
            const newItems = items.filter(item => item.id !== itemId)
            setItems(newItems)
        }
    }

    const handleDeleteCollection = async () => {
        const confirmed = window.confirm(t('misc.deleteCollectionPopup'))
        if (!confirmed) return;
        const res = await authFetchDelete(`/collections/delete/${collectionId}`, store, navigate)
        if (res.ok && res.status === 200)
            navigate('/collections/my')
    }

    useEffect(() => {

        async function fetchCollection() {
            const res = await fetchApi(`/collections/${collectionId}`)
            if (res.status === 404) {
                navigate('/404')
                return;
            }
            const data = await res.json()
            setCollection(data.collection)
            setCustomFields(data.collection.customFields)
            setColumns([
                ...defaultColumns,
                ...data.collection.customFields?.map(f => { return { dataField: f.name, text: f.name, sort: true } })
            ])
            const newItems = data.items.map(item => {
                const customFields = item.customFields.map(c => {
                    switch (c.type) {
                        case 'INTEGER':
                            return { [c.name]: c.value }
                        case 'STRING':
                            return { [c.name]: c.value }
                        case 'TEXT':
                            return { [c.name]: c.value }
                        case 'BOOLEAN':
                            return { [c.name]: <input type='checkbox' disabled checked={c.value === 'true' ? true : false} /> }
                        case 'DATE':
                            return { [c.name]: c.value }
                    }

                })
                const newItem = {
                    id: item.id,
                    name: <Link to={`/collections/${collectionId}/item/${item.id}`}>{item.name}</Link>,
                    tags: item.tags.map(tag => tag.name).join(', ')
                }
                const withCustomFields = Object.assign(newItem, ...customFields)
                return withCustomFields
            })
            setItems(newItems)
            setIsLoading(false)
        }

        fetchCollection()

    }, [])

    const renderColumns = () => {
        if (user.id === collection.ownerId || user.isAdmin)
            return [...columns, {
                dataField: 'addCustomField',
                csvExport: false,
                text: (<div>
                    <AddCustomFieldPopover collectionId={collectionId} addCustomField={addCustomField} />
                    <RemoveCustomFieldPopover collectionId={collectionId} customFields={customFields} removeCustomField={removeCustomField} />
                </div>)
            }]
        else return columns
    }

    if (isLoading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
                <Spinner animation="border" role="status" />
            </div>
        )

    return (
        <>
            {collection && (
                <Container className='mt-5 mb-5'>
                    <Row>
                        <Col xs={12} md={3} lg={2} className="d-flex justify-content-center align-items-center flex-column" style={{ padding: 0 }}>
                            {collection.image && <img src={collection.image} style={{ width: '100%', objectFit: 'cover' }} />}
                            {!collection.image && <img src={urls["no-image-src"]} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
                            {(user.id === collection.ownerId || user.isAdmin) &&
                                <div className="mt-2">
                                    <Link to={`/collections/${collectionId}/edit`}><Button variant="warning" className="me-2"><FaRegEdit /> {t('misc.edit')}</Button></Link>
                                    <Button variant="danger" onClick={handleDeleteCollection}><AiFillDelete /> {t('misc.delete')}</Button>
                                </div>
                            }

                        </Col>
                        <Col xs={12} md={9} lg={10}>
                            <Card.Title>{collection.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{collection.topicId}</Card.Subtitle>
                            <Card.Text>
                                <ReactMarkdown>{collection.description}</ReactMarkdown>
                            </Card.Text>
                        </Col>
                    </Row>
                </Container>
            )}

            {(user.id === collection.ownerId || user.isAdmin) && <Link to={`/collections/${collectionId}/new-item`}><Button variant="primary" style={{ float: 'right', marginBottom: '15px', marginRight: '15px' }}><FcAddRow style={{ marginBottom: '5px', marginRight: '5px' }} />{t('pages.collections.addNewItem')}</Button></Link>}

            {columns.length &&
                <ToolkitProvider
                    keyField='id'
                    data={items.map(item => {
                        return {
                            ...item,
                            addCustomField: (<div style={{ display: 'flex', justifyContent: 'space-evenly' }} key={item.id}>
                                <Link to={`/collections/${collectionId}/edit-item/${item.id}`}><Button variant="warning" style={{ paddingTop: 0, paddingBottom: 0 }}><FaRegEdit /></Button></Link>
                                <Button variant="danger" style={{ paddingTop: 0, paddingBottom: 0 }} onClick={() => handleDeleteItem(item.id)}><AiFillDelete /></Button>
                            </div>)
                        }
                    })}
                    columns={renderColumns()}
                    exportCSV={{
                        separator: ';'
                    }}

                >
                    {
                        props => (<div>
                            <Button variant="info" {...props.csvProps} onClick={() => props.csvProps.onExport()}>Export to CSV</Button>
                            <BootstrapTable {...props.baseProps}
                                filter={filterFactory()} pagination={paginationFactory()} />
                        </div>)
                    }

                </ToolkitProvider>
            }
        </>
    )

}
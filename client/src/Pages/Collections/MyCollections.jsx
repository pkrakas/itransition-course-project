import { useEffect, useState } from "react"
import { Card, Col, Container, Row, Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import urls from "../../Constants/urls"
import authFetchGet from "../../Features/authFetchGet"

export default function MyCollections() {

    const { t } = useTranslation()
    const [collections, setCollections] = useState()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {

        async function fetchCollections() {
            const res = await authFetchGet('/collections/my')
            setCollections(await res.json())
            setIsLoading(false)
        }

        fetchCollections()

    }, [])

    if(isLoading) 
        return (<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" />
    </div>)

    return (
        <Container>
            <h1 className="mt-3 mb-3">{t('pages.collections.myCollections')}</h1>
            {collections &&
                <Row xs={1} sm={2} md={4} className='g-4'>
                    {collections.map(collection => (
                        <Col key={collection.id}>
                            <Link to={`${urls.collections}/${collection.id}`} style={{ textDecoration: 'none' }}>
                                <Card>
                                    {collection.image && <Card.Img variant="top" src={collection.image} style={{ height: '230px', objectFit: 'cover' }} />}
                                    {!collection.image && <Card.Img variant="top" src={urls["no-image-src"]} style={{ height: '230px', objectFit: 'cover' }} />}
                                    <Card.Body>
                                        <Card.Title>{collection.name}</Card.Title>
                                        <Card.Text>
                                            {(new Date(collection.createdAt)).toLocaleDateString('en-GB')}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>))}
                </Row>}
        </Container>
    )
}

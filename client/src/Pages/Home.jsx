import { useEffect, useState } from "react"
import { Card, Col, Container, Row, Spinner } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import './Home.css'
import fetchApi from '../Features/fetchApi'
import urls from "../Constants/urls"
import { useTranslation } from "react-i18next"
import { TagCloud } from 'react-tagcloud'

export default function Home() {

  const { t } = useTranslation()
  const [data, setData] = useState()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetchApi('/featured')
      setData(await res.json())
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if(isLoading) 
    return (<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
    <Spinner animation="border" role="status" />
  </div>)

  return (
      <div>
        <section style={{marginTop: '25px'}}>
          <h4>{t('pages.home.latestItems')}</h4>
          <Container>
            <Row xs={1} sm={2} md={5}>
          {data.latestItems.map(item => <Card key={item.id}>
            <Card.Body>
              <Link to={`/collections/${item.collection.id}/item/${item.id}`}><Card.Title>{item.name}</Card.Title></Link>
              <Card.Subtitle className="mb-2 text-muted">{item.collection.name}</Card.Subtitle>
              <Card.Text>
                {t('pages.home.author')}: {item.collection.owner.email}
              </Card.Text>
            </Card.Body>
          </Card>)}
          </Row>
          </Container>
        </section>
        <section style={{marginTop: '25px'}}>
          <h4>{t('pages.home.biggestCollections')}</h4>
          <Container>
            <Row xs={1} sm={2} md={5}>
              {data.biggestCollections.map(collection => (
                <Col key={collection.id}>
                <Link to={`${urls.collections}/${collection.id}`} style={{ textDecoration: 'none' }}>
                    <Card>
                        {collection.image && <Card.Img variant="top" src={collection.image} style={{ height: '230px', objectFit: 'cover' }} />}
                        {!collection.image && <Card.Img variant="top" src={urls["no-image-src"]} style={{ height: '230px', objectFit: 'cover' }} />}
                        <Card.Body>
                            <Card.Title>{collection.name}</Card.Title>
                            <Card.Text>
                                {collection._count.items} items
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Link>
            </Col>
              ))}
            </Row>
          </Container>
        </section>
        <section style={{marginTop: '25px'}}>
          <h4>{t('pages.home.tagCloud')}</h4>
          <h4>  
            <TagCloud
              minSize={12}
              maxSize={35} 
              tags={data.tagCloud.map(tag => { return {value: tag, count: (Math.random() * (35 - 12) + 12) }})}
              onClick={tag => {navigate(`/search?term=${tag.value}`)}}
              />
          </h4>
        </section>
      </div>
  )
}

import { useEffect, useState } from "react"
import { Badge, Button, Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { useSelector, useStore } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import fetchApi from "../../../Features/fetchApi"
import authFetchGet from '../../../Features/authFetchGet'
import authFetchPost from '../../../Features/authFetchPost'
import io from 'socket.io-client'
import { FcLike, FcLikePlaceholder } from 'react-icons/fc'

export default function Item() {

    const user = useSelector(state => state.user)
    const store = useStore()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { itemId } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState()
    const [item, setItem] = useState()
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState([])

    const [clientSocket] = useState(() => io.connect(process.env.REACT_APP_API_URL))

    useEffect(() => {
        async function fetchItem() {
            const res = await fetchApi(`/items/${itemId}`)
            if (res.ok && res.status === 200)
                setItem(await res.json())
            await fetchComments()
            if (user.isAuthenticated)
                await fetchLike()
            setIsLoading(false)
        }

        async function fetchComments() {
            const res = await fetchApi(`/items/comments/${itemId}`)
            if (res.ok && res.status === 200)
                setComments(await res.json())
        }

        async function fetchLike() {
            const res = await authFetchGet(`/items/like-status/${itemId}`, store, navigate)
            if (res.status === 200)
                setIsLiked(true)
            else setIsLiked(false)
            const data = await res.json()
            setLikeCount(data.likeCount)
        }

        fetchItem()
    }, [])

    useEffect(() => {

        clientSocket.on('connect', () => {
            clientSocket.emit('auth', { userId: user.id, email: user.email })
        })


        clientSocket.on('new_comment', data => {
            if (Number(itemId) === data.itemId)
                setComments(oldComments => [data, ...oldComments])
        })

        return () => {
            clientSocket.close()
        }
    }, [clientSocket])

    const submitComment = () => {
        const commentText = comment.trim()
        if (!commentText.length)
            return;

        clientSocket.emit('comment', { itemId: Number(itemId), comment: commentText })
        setComment('')
    }

    const toggleLike = async () => {
        if (!user.isAuthenticated)
            return;
        const res = await authFetchPost(`/items/like/${itemId}`, {}, store, navigate)
        const data = await res.json()
        if (data.status === "liked")
            setIsLiked(true)
        else if (data.status === "unliked")
            setIsLiked(false)
        setLikeCount(data.likeCount)
    }

    return (<>
        {isLoading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" role="status" />
            </div>
        )}
        {!isLoading &&
            <div className="mt-4">
                <Link to={`/collections/${item.collectionId}`}>{'< '}Back to collection</Link>
                <div style={{ textAlign: 'center' }}>
                    {isLiked && <FcLike size={30} style={{ cursor: "pointer" }} onClick={toggleLike} />}
                    {!isLiked && <FcLikePlaceholder size={30} style={{ cursor: "pointer" }} onClick={toggleLike} />}
                    <br />
                    <Badge bg="info">{likeCount}</Badge>
                    <br />
                </div>
                <div style={{ width: '100%' }} className='mt-3'>
                    <ListGroup as="ul" style={{ width: '360px', margin: '0 auto' }}>
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Name</div>
                                {item.name}
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Tags</div>
                                {item.tags.map(tag => tag.name).join(', ')}
                            </div>
                        </ListGroup.Item>
                        {item.customFields.map(field =>
                            <ListGroup.Item
                                as="li"
                                key={field.id}
                                className="d-flex justify-content-between align-items-start"
                            >
                                <div className="ms-2 me-auto">
                                    <div className="fw-bold">{field.name}</div>
                                    {field.value}
                                </div>
                            </ListGroup.Item>)}

                    </ListGroup>

                </div>
            </div>
        }
        {
            !isLoading && user.isAuthenticated &&
            <Container className="d-flex mt-5 flex-column justify-content-center align-items-center">
                <textarea style={{ width: '350px', height: '120px', resize: 'none' }} value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                <Button style={{ width: '170px', marginTop: '15px' }} onClick={submitComment}>{t('pages.item.leaveCommentButton')}</Button>
            </Container>
        }
        {
            !isLoading && comments.map(comment => (<Card key={comment.id} className="mt-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Card.Header>{comment.author.email} <span style={{ float: 'right' }}>{(new Date(comment.createdAt)).toLocaleString('pl-PL')}</span></Card.Header>
                <Card.Body>
                    <Card.Text>
                        {comment.message}
                    </Card.Text>
                </Card.Body>
            </Card>))
        }
    </>)

}
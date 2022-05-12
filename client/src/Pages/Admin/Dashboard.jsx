import React, { useEffect, useState } from 'react'
import { Button, Spinner, Table } from 'react-bootstrap'
import { useSelector, useStore } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import authFetchGet from '../../Features/authFetchGet'
import authFetchPost from '../../Features/authFetchPost'
import Logout from '../../Features/Logout'
import { logout } from '../../State/Slices/userSlice'
import './Dashboard.css'

export default function Dashboard() {

    const user = useSelector(state => state.user)

    const [users, setUsers] = useState([])
    const [usersSelected, setUsersSelected] = useState([])
    const [checkedAll, setCheckedAll] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useNavigate()
    const store = useStore()

    useEffect(() => {
        async function fetchUsers() {
            const res = await authFetchGet('/admin/users', store, navigate)
            if (res.ok && res.status === 200) {
                setUsers(await res.json())
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const handleUserSelect = id => {
        if(usersSelected.includes(id))
            setUsersSelected(usersSelected.filter(userId => userId !== id))
        else setUsersSelected(old => [...old, id])
        setCheckedAll(false)
    }

    const handleSelectAll = () => {
        if(!checkedAll) {
            setUsersSelected(users.map(user => user.id))
            setCheckedAll(true)
        } else {
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    const handleBlock = async () => {
        if(!usersSelected.length) return;

        const res = await authFetchPost('/admin/block', usersSelected, store, navigate)
        if(res.status === 200) {
            const updatedUsers = users.map(user => {
                if(usersSelected.includes(user.id))
                    user.isBlocked = true
                return user
            })

            if(usersSelected.includes(user.id))
                Logout(store)

            setUsers(updatedUsers)
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    const handleUnBlock = async () => {
        if(!usersSelected.length) return;

        const res = await authFetchPost('/admin/unblock', usersSelected, store, navigate)
        if(res.status === 200) {
            const updatedUsers = users.map(user => {
                if(usersSelected.includes(user.id))
                    user.isBlocked = false
                return user
            })

            setUsers(updatedUsers)
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    const handleDelete = async () => {
        if(!usersSelected.length) return;

        const res = await authFetchPost('/admin/delete', usersSelected, store, navigate)
        if(res.status === 200) {
            const updatedUsers = users.filter(u => !usersSelected.includes(u.id))

            if(usersSelected.includes(user.id))
                Logout(store)

            setUsers(updatedUsers)
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    const handleAdminRights = async () => {
        if(!usersSelected.length) return;

        const res = await authFetchPost('/admin/giveAdmin', usersSelected, store, navigate)
        if(res.status === 200) {
            const updatedUsers = users.map(user => {
                if(usersSelected.includes(user.id))
                    user.isAdmin = true
                return user
            })

            setUsers(updatedUsers)
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    const handleRemoveAdmin = async () => {
        if(!usersSelected.length) return;

        const res = await authFetchPost('/admin/removeAdmin', usersSelected, store, navigate)
        if(res.status === 200) {
            const updatedUsers = users.map(user => {
                if(usersSelected.includes(user.id))
                    user.isAdmin = false
                return user
            })

            setUsers(updatedUsers)
            setUsersSelected([])
            setCheckedAll(false)
        }
    }

    if (isLoading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" role="status" />
            </div>
        )

    return (<div className="d-flex justify-content-center flex-column" style={{height: '50vh'}}>
        <div className="toolbar">
            <Button variant="secondary" onClick={handleBlock}>Block</Button>
            <Button onClick={handleUnBlock}>Unblock</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
            <Button variant="warning" onClick={handleAdminRights}>Give admin rights</Button>
            <Button variant="outline-secondary" onClick={handleRemoveAdmin}>Remove from admins</Button>
        </div>
        <Table bordered hover>
            <thead>
                <tr>
                    <th><input type="checkbox" checked={checkedAll} onChange={handleSelectAll} /></th>
                    <th>Id</th>
                    <th>Email</th>
                    <th>isBlocked</th>
                    <th>isAdmin</th>
                    <th>createdAt</th>
                </tr>
            </thead>
            <tbody>
                {
                    users.map(user => <tr key={user.id}>
                        <td><input type="checkbox" checked={usersSelected.includes(user.id)} onChange={() => handleUserSelect(user.id)}/></td>
                        <td>{user.id}</td>
                        <td><Link to={`/admin/collections/${user.id}`}>{user.email}</Link></td>
                        <td>{user.isBlocked ? 'true' : 'false'}</td>
                        <td>{user.isAdmin ? 'true' : 'false'}</td>
                        <td>{(new Date(user.createdAt)).toLocaleString()}</td>
                    </tr>)
                }
            </tbody>
        </Table>

    </div>)
}
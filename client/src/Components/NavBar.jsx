import React, { useContext, useState } from 'react'
import { Button, Container, Form, FormControl, Navbar, NavDropdown } from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { ThemeContext } from '../Context/ThemeProvider';
import { BsMoonFill, BsSun } from 'react-icons/bs'
import { AiOutlineAppstoreAdd } from 'react-icons/ai'
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useStore } from 'react-redux';
import Logout from '../Features/Logout';

export const NavBar = () => {

    const { t, i18n } = useTranslation()
    const [theme, toggleTheme] = useContext(ThemeContext)
    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState('')

    const user = useSelector(state => state.user)
    const store = useStore()

    const changeLanguage = () => {
        if (i18n.language === 'en')
            i18n.changeLanguage('pl')
        else if (i18n.language === 'pl')
            i18n.changeLanguage('en')
    }

    const onSearchSubmit = (e) => {
        e.preventDefault()
        const term = searchTerm.trim()
        if(!term.length)
            return;
        setSearchTerm('')
        navigate(`/search?term=${term}`)
    }

    return (
        <div>
            <Navbar bg={theme} expand="lg">
                <Container >
                    <Navbar.Brand><Link to="/" style={{ textDecoration: 'none' }}>ITransition Course Project</Link></Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Container>
                            <Form className="d-inline-flex" onSubmit={onSearchSubmit}>
                                <FormControl
                                    type="search"
                                    placeholder={t('navbar.search')}
                                    className="me-2"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                />

                                <Button variant="outline-success" type="submit">{t('navbar.search')}</Button>
                            </Form>
                            <Form className="d-inline-flex float-md-end">

                                <Button onClick={() => toggleTheme()} variant="outlined">{theme === 'light' ? <BsMoonFill /> : <BsSun />}</Button>
                                <img width="25px"
                                    height="25px"
                                    className="mt-2"
                                    src={i18n.language === 'en' ? '/img/pl-flag-button-round.png' : '/img/uk-flag-button-round.png'}
                                    onClick={changeLanguage}
                                    style={{ cursor: 'pointer' }}
                                />
                                {!user.isAuthenticated && <Link to='/login'><Button className="mx-2">{t('navbar.login')}</Button></Link>}
                                {!user.isAuthenticated && <Button variant="secondary">{t('navbar.register')}</Button>}
                                {user.isAuthenticated && <div className="d-flex">
                                    <Link to="/collections/new" className="d-none d-xl-block">
                                        <Button variant="primary" className="ms-3">
                                            <AiOutlineAppstoreAdd className="me-2" />{t('navbar.createCollection')}
                                        </Button>
                                    </Link>
                                    <Link to="/collections/new" className="d-md-block d-xl-none">
                                        <Button variant="primary" className="ms-3">
                                            <AiOutlineAppstoreAdd className="me-2" />
                                        </Button>
                                    </Link>
                                    <NavDropdown title={user.email} >
                                        <LinkContainer to='/collections/my'><NavDropdown.Item>{t('navbar.myCollections')}</NavDropdown.Item></LinkContainer>
                                        {user.isAdmin && <LinkContainer to='/admin/dashboard'><NavDropdown.Item>Admin panel</NavDropdown.Item></LinkContainer>}
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={() => Logout(store)}>Logout</NavDropdown.Item>
                                    </NavDropdown>
                                </div>
                                }
                            </Form>
                        </Container>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    )
}

import { Form, Button } from 'react-bootstrap'
import './Login.css'
import * as Yup from 'yup'
import { Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../State/Slices/userSlice';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email address is required.'),
    password: Yup.string().required('Password is required')
})

const API_URL = process.env.REACT_APP_API_URL

export default function Login() {

    const { t, i18n } = useTranslation()

    const [errorMessage, setErrorMessage] = useState('')

    const user = useSelector(state => state.user)
    const dispatch = useDispatch()

    const navigate = useNavigate()

    async function handleForm(values) {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password
            })
        })

        if (res.ok && res.status === 200) {

            const data = await res.json()
            
            dispatch(login(data.token))

            navigate('/')

        } else if (res.status === 400) {
            setErrorMessage('Wrong email or password.')
        } else if (res.status === 403) {
            setErrorMessage('Account is blocked.')
        } else if (res.status === 500) {
            setErrorMessage('Invalid credentials.')
        }
    }

    const handleGoogleLogin = async () => {
        window.open(`${API_URL}/users/login/google`, '_self')
    }

    const handleFacebookLogin = async () => {
        window.open(`${API_URL}/users/login/facebook`, '_self')
    }

    useEffect(() => {
        if (user?.isAuthenticated) navigate('/')
    }, [])

    if (!user?.isAuthenticated)
        return (
            <div className='login-form-container'>
                <div className='login-form'>
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                        }}
                        validationSchema={LoginSchema}
                        onSubmit={handleForm}
                    >
                        {({ handleChange, handleSubmit, handleBlur, values, errors, touched }) => (
                            <Form onSubmit={handleSubmit}>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>{t('auth.emailAddress')}</Form.Label>
                                    <Form.Control type="email" name="email" placeholder={t('auth.enterEmail')} onChange={handleChange} onBlur={handleBlur} value={values.email} />

                                    {errors.email && touched.email ? <Form.Text className="text-muted">{errors.email}</Form.Text> : null}

                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>{t('auth.password')}</Form.Label>
                                    <Form.Control type="password" name="password" placeholder={t('auth.password')} onChange={handleChange} onBlur={handleBlur} value={values.password} />
                                    {errors.password && touched.password ? <Form.Text className="text-muted">{errors.password}</Form.Text> : null}
                                </Form.Group>
                                <div className="submit-area">
                                    {errorMessage && <Form.Text className="text-muted">{errorMessage}</Form.Text>}
                                    <Button variant="primary" type="submit" className="submit-button">
                                        {t('auth.login')}
                                    </Button>
                                    <Button style={{backgroundColor: "#4285F4", width: "220px"}} className="mt-3" onClick={handleGoogleLogin}>
                                        <img src="/img/google-icon.png" width="25px" style={{float: 'left'}}/>
                                        {t('auth.loginWithGoogle')}
                                    </Button>
                                    <Button style={{backgroundColor: "#4285F4", width: "220px"}} className="mt-3" onClick={handleFacebookLogin}>
                                        <img src="/img/facebook-icon.png" width="25px" className="me-2"/>
                                        {t('auth.loginWithFacebook')}
                                    </Button>
                                    <br />
                                    <Link to="/register">{t('auth.registerInstead')}</Link>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        )
}
import { Form, Button } from 'react-bootstrap'
import './Register.css'
import * as Yup from 'yup'
import { Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const RegisterSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email address is required.'),
    password: Yup.string().required('Password is required'),
    repeatPassword: Yup.string().required('Repeat password').oneOf([Yup.ref('password'), null], 'Passwords must match')
})

const API_URL = process.env.REACT_APP_API_URL

export default function Register() {

    const [errorMessage, setErrorMessage] = useState('')

    const user = useSelector(state => state.user)

    const navigate = useNavigate()

    async function handleForm(values) {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password
            })
        })

        if (res.ok && res.status === 200)
            navigate('/login')
        else if (res.status === 409) {
            setErrorMessage('Account already exists.')
        }
    }

    useEffect(() => {
        if (user?.isAuthenticated) navigate('/')
    }, [])

    if (!user?.isAuthenticated)
        return (
            <div className="register-form-container">
                <div className='register-form'>
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                            repeatPassword: ''
                        }}
                        validationSchema={RegisterSchema}
                        onSubmit={handleForm}
                    >
                        {({ handleChange, handleSubmit, handleBlur, values, errors, touched }) => (
                            <Form onSubmit={handleSubmit}>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleChange} onBlur={handleBlur} value={values.email} />

                                    {errors.email && touched.email ? <Form.Text className="text-muted">{errors.email}</Form.Text> : null}

                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} value={values.password} />
                                    {errors.password && touched.password ? <Form.Text className="text-muted">{errors.password}</Form.Text> : null}
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicRepeatPassword">
                                    <Form.Label>Repeat password</Form.Label>
                                    <Form.Control type="password" name="repeatPassword" placeholder="Repeat password" onChange={handleChange} onBlur={handleBlur} value={values.repeatPassword} />
                                    {errors.repeatPassword && touched.repeatPassword ? <Form.Text className="text-muted">{errors.repeatPassword}</Form.Text> : null}
                                </Form.Group>
                                <div className="submit-area">
                                    {errorMessage && <Form.Text className="text-muted">{errorMessage}</Form.Text>}
                                    <Button variant="primary" type="submit">
                                        Register
                                    </Button>
                                    <br />
                                    <Link to="/login">Log in instead</Link>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        )
}
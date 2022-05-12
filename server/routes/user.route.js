import bcrypt from 'bcrypt'
import express from 'express'
import getPrisma from '../utils/getPrisma.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/login', (req, res, next) => {
    passport.authenticate('passwordLogin', (err, user, info) => {
        try {
            if (err || !user) 
                return next(new Error('An error occurred.'))
            if(user.isBlocked)
                return res.status(403).send()

            req.login(user, { session: false}, (error) => {
                if(error) return next(error)
                const body = {id: user.id, email: user.email, isAdmin: user.isAdmin, isBlocked: user.isBlocked}
                const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

                res.json({token})
            })

        } catch (error) {
            return next(error)
        }
    })(req, res, next)
})

router.get('/login/google', passport.authenticate('google', {scope: ['email']}))

router.get('/oauth2/redirect/google', (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/users/oauth2/success',
    })(req, res, next)
});

router.get('/login/facebook', passport.authenticate('facebook', {scope: ['email']}))

router.get('/oauth2/redirect/facebook', (req, res, next) => {
    passport.authenticate('facebook', {
        successRedirect: '/users/oauth2/success',
    })(req, res, next)
});

router.get('/oauth2/success', (req, res) => {
    const user = req.user
    const body = {id: user.id, email: user.email, isAdmin: user.isAdmin, isBlocked: user.isBlocked}
    const token = jwt.sign({ user: body }, process.env.JWT_SECRET);
    res.redirect(`${process.env.CLIENT_URL}/oauth2?token=${token}`)
})

router.post('/register', async (req, res) => {
    const { email, password } = req.body
    const prisma = getPrisma()

    if (!email || !password) {
        res.status(400).send('Please provide email and password.')
        return;
    }

    const exists = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (exists) {
        res.status(409).send()
        return;
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    if (passwordHash) {
        await prisma.user.create({ data: { email, password: passwordHash } })
        res.status(200).send()
    } else {
        res.status(500).send()
    }

})

export default router
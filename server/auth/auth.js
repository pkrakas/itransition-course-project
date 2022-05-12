import getPrisma from "../utils/getPrisma.js"
import PassportLocal from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt'
import GoogleStrategy from 'passport-google-oidc'
import FacebookStrategy from 'passport-facebook'
import bcrypt from 'bcrypt'

export default function PassportAuth(passport) {

    const prisma = getPrisma()

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser(async ({email}, done) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return done(null, false, { message: 'User not registered.' })
        done(null, user)
    })

    passport.use('passwordLogin', new PassportLocal.Strategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return done(null, false, { message: 'User not found.' })

        bcrypt.compare(password, user.password, (err, result) => {

            if (err) return done(err)

            if (!result) return done(null, false, { message: 'Incorrect password.' })

            return done(null, user)
        })
    }))

    passport.use('jwtUserAuth',
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            },
            async (token, done) => {
                try {
                    const user = await prisma.user.findUnique({ where: { email: token.user.email } })
                    if (user.isBlocked)
                        return done(null, false, { message: 'User is blocked.' })
                    return done(null, { id: user.id, email: user.email, isAdmin: user.isAdmin, isBlocked: user.isBlocked });
                } catch (error) {
                    done(error);
                }
            }
        )
    )

    passport.use('jwtAdminAuth',
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            },
            async (token, done) => {
                try {
                    const user = await prisma.user.findUnique({ where: { email: token.user.email } })
                    if (user.isBlocked)
                        return done(null, false, { message: 'User is blocked.' })
                    if(!user.isAdmin)
                        return done(null, false, { message: 'User has no admin rights.' })
                    return done(null, { id: user.id, email: user.email, isAdmin: user.isAdmin, isBlocked: user.isBlocked });
                } catch (error) {
                    done(error);
                }
            }
        )
    )

    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/users/oauth2/redirect/google',
        scope: ['email']
    }, async (issuer, profile, callback) => {
            const email = profile.emails[0].value
            let user = await prisma.user.findUnique({ where: { email } })
            if (!user) user = await prisma.user.create({ data: { email } })
            callback(null, user)
    }))

    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL}/users/oauth2/redirect/facebook`,
        profileFields: ['emails']
    }, async (accessToken, refreshToken, profile, callback) => {
        const email = profile.emails[0].value
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) user = await prisma.user.create({ data: { email } })
        callback(null, user)
    }))

}

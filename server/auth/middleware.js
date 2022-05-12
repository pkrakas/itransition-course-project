import passport from "passport"
import getPrisma from "../utils/getPrisma.js"

const prisma = getPrisma()

export const auth = (req, res, next) => {
    return passport.authenticate('jwtUserAuth', { session: false })(req, res, next)
}

export const admin = (req, res, next) => {
    return passport.authenticate('jwtAdminAuth', { session: false })(req, res, next)
}

export const owner = async (req, res, next) => {
    const userId = req.user.id
    const collectionId = Number(req.params.collectionId)

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    const { ownerId } = await prisma.collection.findUnique({
        where: {
            id: collectionId
        },
        select: {
            ownerId: true
        }
    })  
    
    if(userId === ownerId || user.isAdmin)
        next()
    else res.status(403).send('User has no access to this resource.')

}
import express from 'express'
import { admin } from '../auth/middleware.js'
import getPrisma from '../utils/getPrisma.js'

const router = express.Router()
const prisma = getPrisma()

router.get('/users', admin, async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            isAdmin: true,
            isBlocked: true,
            createdAt: true
        }
    })
    res.send(users)
})

router.get('/collections/:userId', admin, async (req, res) => {
    const userId = Number(req.params.userId)
    const collections = await prisma.collection.findMany({
        where: {
            ownerId: userId
        }
    })
    res.send(collections)
})

router.post('/block', admin, async (req, res) => {
    const usersToBlock = req.body
    for(const id of usersToBlock)
        await prisma.user.update({
            data: {
                isBlocked: true
            },
            where: {
                id
            }
        })
    res.send()
})

router.post('/unblock', admin, async (req, res) => {
    const usersToUnBlock = req.body
    for(const id of usersToUnBlock)
        await prisma.user.update({
            data: {
                isBlocked: false
            },
            where: {
                id
            }
        })
    res.send()
})

router.post('/giveAdmin', admin, async (req, res) => {
    const usersToAdmin = req.body
    for(const id of usersToAdmin)
        await prisma.user.update({
            data: {
                isAdmin: true
            },
            where: {
                id
            }
        })
    res.send()
})

router.post('/removeAdmin', admin, async (req, res) => {
    const usersToRemoveAdmin = req.body
    for(const id of usersToRemoveAdmin)
        await prisma.user.update({
            data: {
                isAdmin: false
            },
            where: {
                id
            }
        })
    res.send()
})

router.post('/delete', admin, async (req, res) => {
    const usersToRemove = req.body
    for(const id of usersToRemove)
        await prisma.user.delete({
            where: {
                id
            }
        })
    res.send()
})

export default router
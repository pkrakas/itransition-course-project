import express from 'express'
import getPrisma from '../utils/getPrisma.js'
import _ from 'underscore'

const router = express.Router()
const prisma = getPrisma()

router.get('/featured', async (req, res) => {

    const latest = await prisma.item.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            name: true,
            collection: {
                select: {
                    id: true,
                    name: true,
                    owner: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        }
    })

    const biggest = await prisma.collection.findMany({
        include: {
            _count: {
                select: {
                    items: true
                }
            }
        }
    })
    biggest.sort((a, b) => b._count.items - a._count.items)

    const tags = (await prisma.tag.groupBy({
        by: ['name']
    })).map(tag => tag.name)

    res.send({latestItems: latest.slice(0, 5), biggestCollections: biggest.slice(0, 5), tagCloud: tags.slice(0, 10)})
})

export default router
import express from 'express'
import getPrisma from '../utils/getPrisma.js'
import { auth, owner } from '../auth/middleware.js'

const router = express.Router()
const prisma = getPrisma()

router.get('/user-tags', auth, async (req, res) => {
    
    const userTags = await prisma.tag.findMany({
        where: {
            authorId: req.user.id
        }
    })
    res.send(userTags)
})


router.get('/:itemId', async (req, res) => {
    const itemId = Number(req.params.itemId)

    if(isNaN(itemId)) {
        res.status(400).send()
        return;
    }

    const item = await prisma.item.findUnique({
        where: {
            id: itemId
        },
        include: {
            customFields: true,
            tags: true,
            collection: true
        }
    })

    if(!item) {
        res.status(400).send()
        return;
    }

    const collection = await prisma.collection.findUnique({
        where: {
            id: item.collectionId
        },
        include: {
            customFields: {
                where: {
                    itemId: null
                }
            }
        }
    })

    if(!collection) {
        res.status(404).send()
        return;
    }

    const tempFields = collection.customFields.map((field, index) => {
        const existingField = item.customFields.find(item => item.name === field.name)

        if(existingField)
            return existingField
        else return collection.customFields[index]
    })

    res.status(200).send({...item, customFields: tempFields})

})

router.get('/search/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params

    const byName = await prisma.item.findMany({
        where: {
            name: {
                search: searchTerm
            }
        }
    })
    const byTags = await prisma.tag.findMany({
        where: {
            name: {
                search: searchTerm
            }
        },
        include: {
            item: true
        }
    })
    const byComments = await prisma.comment.findMany({
        where: {
            message: {
                search: searchTerm
            }
        },
        include: {
            item: true
        }
    })

    const items = [...byName, ...(byTags.map(tag => tag.item)), ...(byComments.map(comment => comment.item))]
    res.send(items)
})

router.get('/comments/:itemId', async (req, res) => {
    const { itemId } = req.params

    let comments = await prisma.comment.findMany({
        where: {
            itemId: Number(itemId)
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            message: true,
            createdAt: true,
            itemId: true,
            author: {
                select: {
                email: true
                }
            }
        }
    })

    res.send(comments)
})

router.get('/like-status/:itemId', auth, async (req, res) => {
    const {itemId} = req.params
    const userLike = await prisma.like.findFirst({
        where: {
            itemId: Number(itemId),
            authorId: req.user.id
        }
    })

    const likeCount = await prisma.like.count({
        where: {
            itemId: Number(itemId)
        }
    })

    if(userLike)
        res.status(200)
    else res.status(404)

    res.send({likeCount})
})

router.post('/like/:itemId', auth, async (req, res) => {
    const { itemId } = req.params
    const currentLike = await prisma.like.findFirst({
        where: {
            itemId: Number(itemId),
            authorId: req.user.id
        }
    })
    const likeCount = await prisma.like.count({
        where: {
            itemId: Number(itemId)
        }
    })
    if(!currentLike) {
        await prisma.like.create({
            data: {
                itemId: Number(itemId),
                authorId: req.user.id
            }
        })
        res.send({status: "liked", likeCount: likeCount + 1})
    }
    else {
        await prisma.like.delete({
            where: {
                id: currentLike.id
            }
        })
        
        res.send({status: "unliked", likeCount: likeCount - 1})
    }
    
})


router.post('/:collectionId/update/:itemId', auth, owner, async (req, res) => {
    const itemId = Number(req.params.itemId)
    const collectionId = Number(req.params.collectionId)

    if(isNaN(itemId) || isNaN(collectionId)) {
        res.status(400).send()
        return;
    }

    let data = req.body

    await prisma.item.update({
        where: {
            id: itemId
        },
        data: {
            name: data.name
        }
    })

    let currentTags = await prisma.tag.findMany({
        where: {
            itemId
        }
    })

    const results1 = currentTags.map(async currentTag => {
        if(!data.tags.includes(currentTag.name))
            await prisma.tag.delete({
                where: {
                    id: currentTag.id
                }
            })
    })
    await Promise.all(results1)

    currentTags = currentTags.map(tag => tag.name)
    const results2 = data.tags.map(async tag => {
        if(!currentTags.includes(tag))
            await prisma.tag.create({
                data: {
                    name: tag,
                    itemId,
                    authorId: req.user.id
                }
            })
    })
    
    await Promise.all(results2)

    const results3 = Object.keys(data.customFields).map(async key => {
        if(typeof data.customFields[key] === 'boolean')
            data.customFields[key] = data.customFields[key] ? 'true' : 'false'
            
        const updated = await prisma.customField.updateMany({
            where: {
                name: key,
                itemId
            },
            data: {
                value: data.customFields[key]
            }
        })
        if(updated.count === 0) {
            const shadowField = await prisma.customField.findMany({
                where: {
                    name: key,
                    itemId: null,
                    collectionId
                }
            })

            if(shadowField.length)
                await prisma.customField.create({
                    data: {
                        name: key,
                        itemId,
                        collectionId,
                        type: shadowField[0].type,
                        value: data.customFields[key]
                    }
                })
        }
            
    })

    await Promise.all(results3)

    res.send()
})


router.delete('/:collectionId/:itemId', auth, owner, async (req, res) => {
    const itemId = Number(req.params.itemId)

    if(isNaN(itemId)) {
        res.status(400).send()
        return;
    }

    const item = await prisma.item.delete({
        where: {
            id: itemId
        }
    })

    if(!item) {
        res.status(400).send()
        return;
    }

    res.status(200).send()

})

export default router
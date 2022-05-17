import express from 'express'
import cloudinary from '../utils/cloudinary.js'
import getPrisma from '../utils/getPrisma.js'
import { auth, owner } from '../auth/middleware.js'

const router = express.Router()
const prisma = getPrisma()

router.get('/my', auth, async (req, res) => {

    const collections = await prisma.collection.findMany({
        where: {
            ownerId: req.user.id
        }
    })

    res.send(collections)
})

router.get('/:id', async (req, res) => {

    const id = Number(req.params.id)

    if (isNaN(id)) {
        res.status(400).send()
        return;
    }

    const collection = await prisma.collection.findUnique({
        where: {
            id
        },
        include: {
            customFields: {
                where: {
                    itemId: null
                }
            }
        }
    })

    if (!collection) {
        res.status(404).send()
        return;
    }

    const items = await prisma.item.findMany({
        where: {
            collectionId: id
        },
        include: {
            customFields: true,
            tags: true
        }
    })

    res.send({ collection, items })
})

router.post('/new', auth, async (req, res) => {

    const { name, topic, description, image } = req.body
    let imageSrc = ''

    if (image.length) {
        const uploadResponse = await cloudinary.uploader.upload(image, { upload_preset: 'ml_default' })
        imageSrc = uploadResponse.secure_url
    }

    const newCollection = await prisma.collection.create({
        data: {
            name,
            topicId: topic,
            description,
            image: imageSrc,
            ownerId: req.user.id
        }
    })

    res.status(200).send({ collectionId: newCollection.id })
})

router.post('/edit/:collectionId', auth, owner, async (req, res) => {
    const { name, topic, description, image } = req.body

    const collectionId = Number(req.params.collectionId)

    let imageSrc = (await prisma.collection.findUnique({
        where: {
            id: collectionId
        },
        select: {
            image: true
        }
    })).image

    if (image?.length) {
        const uploadResponse = await cloudinary.uploader.upload(image, { upload_preset: 'ml_default' })
        imageSrc = uploadResponse.secure_url
    }

    const updatedCollection = await prisma.collection.update({
        data: {
            name,
            topicId: topic,
            description,
            image: imageSrc
        },
        where: {
            id: collectionId
        }
    })

    if (updatedCollection)
        res.status(200).send()
    else res.status(400).send()

})

router.delete('/delete/:collectionId', auth, owner, async (req, res) => {
    const collectionId = Number(req.params.collectionId)
    await prisma.collection.delete({
        where: {
            id: collectionId
        }
    })
    res.status(200).send()
})

router.post('/:collectionId/new-custom-field', auth, owner, async (req, res) => {

    const collectionId = Number(req.params.collectionId)

    const { name, fieldType } = req.body

    const exists = await prisma.customField.findMany({
        where: {
            AND: [
                { id: collectionId },
                { name }
            ]
        }
    })

    if (exists.length) {
        res.status(400).send('Field name already exists.')
        return;
    }

    await prisma.customField.create({
        data: {
            name,
            type: fieldType,
            collectionId: collectionId
        },
        include: {
            collection: true
        }
    })

    res.send()
})

router.get('/:collectionId/custom-fields', auth, async (req, res) => {

    const collectionId = Number(req.params.collectionId)

    if (isNaN(collectionId)) {
        res.status(400).send()
        return;
    }

    const collection = await prisma.collection.findUnique({
        where: {
            id: collectionId
        },
        include: {
            customFields: {
                where: {
                    itemId: null
                }
            }
        }
    })

    if (!collection) {
        res.status(404).send()
        return;
    }

    res.send({ customFields: collection.customFields })
})

router.post('/:collectionId/remove-custom-field', auth, owner, async (req, res) => {
    const { field } = req.body
    const collectionId = Number(req.params.collectionId)

    await prisma.customField.deleteMany({
        where: {
            collectionId,
            name: field
        }
    })

    res.send()
})

router.post('/:collectionId/new-item', auth, owner, async (req, res) => {
    const collectionId = Number(req.params.collectionId)

    if (isNaN(collectionId)) {
        res.status(400).send()
        return;
    }

    const data = req.body

    const newItem = await prisma.item.create({
        data: {
            name: data.name,
            collectionId
        }
    })

    const result1 = data.tags.map(async tag => {

        const exists = await prisma.tag.findMany({
            where: {
                name: tag,
                itemId: newItem.id,
                authorId: req.user.id
            }
        })

        if (!exists.length) {
            await prisma.tag.create({
                data: {
                    name: tag,
                    itemId: newItem.id,
                    authorId: req.user.id
                }
            })
        }
    })

    await Promise.all(result1)

    if(!data.customFields) {
        res.send()
        return;
    }

    const result2 = Object.keys(data.customFields).map(async field => {
        if (typeof data.customFields[field] === 'boolean')
            data.customFields[field] = data.customFields[field] ? 'true' : 'false'

        const tempField = await prisma.customField.findMany({
            where: {
                name: field,
                itemId: null,
                collectionId
            }
        })
        if (tempField[0]) {
            await prisma.customField.create({
                data: {
                    name: field,
                    value: data.customFields[field],
                    type: tempField[0].type,
                    itemId: newItem.id,
                    collectionId

                }
            })
        }

    })
    await Promise.all(result2)

    res.send()
})



export default router
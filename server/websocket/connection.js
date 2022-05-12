import getPrisma from "../utils/getPrisma.js"

export default (io) => {

    const clients = new Map()
    const prisma = getPrisma()

    io.on('connection', socket => {

        socket.on('auth', data => {
            clients.set(socket.id, {email: data.email, id: data.userId})
        })

        socket.on('comment', async data => {
            const user = clients.get(socket.id)
            const {itemId, comment} = data

            const newComment = await prisma.comment.create({
                data: {
                    message: comment,
                    authorId: user.id,
                    itemId
                }
            })

            io.emit('new_comment', {id: newComment.id, author: {email: user.email}, itemId, message: comment, createdAt: newComment.createdAt})
            
        })

        socket.on('disconnect', reason => {
            clients.delete(socket.id)
        })

    })
    
}
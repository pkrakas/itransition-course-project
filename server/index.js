import express from 'express'
import session from 'express-session'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { config as DotEnvConfig} from 'dotenv'
import SocketIOConnection from './websocket/connection.js'
import passport from 'passport'
import PassportAuth from './auth/auth.js'
import userRoute from './routes/user.route.js'
import collectionsRoute from './routes/collections.route.js'
import itemsRoute from './routes/items.route.js'
import homeRoute from './routes/home.route.js'
import adminRoute from './routes/admin.route.js'

DotEnvConfig()
const PORT = process.env.PORT || 8000

const app = express()

app.use(cors())
app.use(express.json({limit: '10mb'}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

PassportAuth(passport)

app.use('/', homeRoute)
app.use('/users', userRoute)
app.use('/collections', collectionsRoute)
app.use('/items', itemsRoute)
app.use('/admin', adminRoute)

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
})

SocketIOConnection(io)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
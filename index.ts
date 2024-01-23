import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'
import { FirebaseClient } from './models/firebaseClient'

dotenv.config({ path: path.join(process.cwd(), '.env') })

//configuracion del servidor

const server = express()
server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

FirebaseClient.bootstrap()

// rutas - endpoints

server.get("/", (req:Request, res: Response) => res.send("Hola servidor typescript"));

server.listen(process.env.PORT, () => {
    console.log("server listening on port " + process.env.PORT);
})
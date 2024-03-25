import {Reset} from './entity/reset.entity'

require('dotenv').config()

import express from 'express'
import {DataSource} from "typeorm"
import 'dotenv/config'
import {routes} from "./routes"
import {User} from "./entity/user.entity"
import cors from 'cors'
import cookieParser from 'cookie-parser'

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        "src/entity/*.ts"
    ],
    synchronize: true,
})

export const userRepository = AppDataSource.getRepository(User)
export const resetRepository = AppDataSource.getRepository(Reset)

AppDataSource.initialize().then(() => {
    const app = express();

    app.use(express.json())
    app.use(cookieParser())

    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
        credentials: true
    }))

    routes(app);

    app.listen(8000, () => {
        console.log('listening on port 8000')
    });
}).catch((error) => {
    console.error('error initializing data source:', error)
})
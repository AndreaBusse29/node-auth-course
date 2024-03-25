import {Request, Response} from "express"
import bcryptjs from 'bcryptjs'
import {userRepository} from "../index"
import {JwtPayload, sign, verify} from "jsonwebtoken"
import {User} from "../entity/user.entity"

export const Register = async (request: Request, response: Response) => {
    const body = request.body

    if (body.password !== body.passwordConfirm) {
        return response.status(400).send('passwords are not identical')
    }

    const user = await userRepository.save({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: await bcryptjs.hash(body.password, 12),
    })

    const {password, ...data} = user as User

    response.send(data)
}

export const Login = async (request: Request, response: Response) => {
    const existingUser = await userRepository.findOneBy({
        email: request.body.email
    })

    if (!existingUser) {
        return response.status(400).send({message: 'User not found, please check credentials'})
    }

    if (!await bcryptjs.compare(request.body.password, existingUser?.password as string)) {
        return response.status(400).send({
            message: 'Invalid credentials'
        })
    }

    const accessToken = sign({
        id: existingUser.id,
    }, process.env.ACCESS_SECRET || '',{expiresIn: '30s'})

    const refreshToken = sign({
        id: existingUser.id,
    }, process.env.REFRESH_SECRET || '',{expiresIn: '1w'})

    response.cookie('access_token', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    response.send({
        message: 'success'
    })
}

export const AuthenticatedUser = async (request: Request, response: Response) => {
    try {
        const cookie = request.cookies['access_token']
        const payload: JwtPayload | string = verify(cookie, process.env.ACCESS_SECRET || '') as JwtPayload

        if (!payload) {
            return response.status(401).send({
                message: 'Unauthenticated'
            })
        }

        const user = await userRepository.findOneBy({
            id: payload.id
        })

        const {password, ...data} = user as User

        response.send(data)
    } catch (e) {
        return response.status(401).send({
            message: 'Unauthenticated'
        })
    }
}

export const Refresh = async (request: Request, response: Response) => {
    try {
        const cookie = request.cookies['refresh_token']
        const payload: JwtPayload | string = verify(cookie, process.env.REFRESH_SECRET || '') as JwtPayload

        if (!payload) {
            return response.status(401).send({
                message: 'Unauthenticated'
            })
        }

        const accessToken = sign({
            id: payload.id,
        }, process.env.ACCESS_SECRET || '',{expiresIn: '30s'})

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        response.send({
            message: 'success'
        })
    } catch (e) {
        return response.status(401).send({
            message: 'Unauthenticated'
        })
    }
}

export const Logout = async (request: Request, response: Response) => {
    response.cookie('access_token', {maxAge: 0})
    response.cookie('refresh_token', {maxAge: 0})

    response.send({
        message: 'success'
    })
}
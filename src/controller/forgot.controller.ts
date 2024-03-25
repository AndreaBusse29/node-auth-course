import {Request, Response} from 'express'
import {resetRepository, userRepository} from '../index'
import {createTransport} from 'nodemailer'
import bcryptjs from 'bcryptjs'

export const ForgotPassword = async (request: Request, response: Response) => {
    const {email} = request.body;

    const token = Math.random().toString(20).substring(2, 12)

    await resetRepository.save({
        email,
        token
    })

    const transporter = createTransport({
        host: '0.0.0.0',
        port: 1025
    })
    const url = `http://localhost:3000/reset/${token}`

    await transporter.sendMail({
        from: 'noreply@example.com',
        to: email,
        subject: 'Please reset your password',
        html: `Click <a href="${url}">here</a> to reset your password!`
    })
    response.send({
        message: 'An email with instructions on how to reset your password has been sent. Please check your email.'
    })
}

export const ResetPassword = async (request: Request, response: Response) => {
    const {token, password, passwordConfirm} = request.body

    if (password !== passwordConfirm) {
        return response.status(400).send({
            message: 'The passwords do not match!'
        })
    }

    const resetPassword = await resetRepository.findOneBy({
        token
    })

    if (!resetPassword) {
        return response.status(400).send({
            message: 'Invalid link!'
        })
    }

    const user = await userRepository.findOneBy({
        email: resetPassword.email
    })

    if (!user) {
        return response.status(404).send({
            message: 'User not found'
        })
    }

    await userRepository.update(user.id,{
        password: await bcryptjs.hash(password, 12)
    })

    response.send({
        message: 'success'
    })
}
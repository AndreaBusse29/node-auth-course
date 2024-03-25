import {Router} from "express"
import {AuthenticatedUser, Login, Logout, Refresh, Register} from "./controller/auth.controller"
import {ForgotPassword, ResetPassword} from './controller/forgot.controller'

export const routes = (router: Router) => {
    router.post('/api/register', Register)
    router.post('/api/login', Login)
    router.post('/api/refresh', Refresh)
    router.post('/api/logout', Logout)
    router.post('/api/forgot-password', ForgotPassword)
    router.post('/api/reset-password', ResetPassword)

    router.get('/api/user', AuthenticatedUser)
}
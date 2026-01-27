import express from 'express'
import passport from 'passport'
import { getUsers, getUserById, updateUser, deleteUser, registerUser, loginUser, restrictUser, protectedRoute, forgotPassword, resetPassword, changePassword, verifyEmail, resendVerificationEmail, logoutUser, logoutAllDevices, deleteUserAccount } from '../controllers/userController.js'

const router = express.Router()

router.route('/')
.get(protectedRoute,getUsers)

router.route('/register')
.post(registerUser)

router.route('/login')
.post(passport.authenticate('local', { session: false }), loginUser)

// Logout routes
router.route('/logout')
.post(protectedRoute, logoutUser)

router.route('/logout-all-devices')
.post(protectedRoute, logoutAllDevices)

// Email verification routes
router.route('/verify-email/:token')
.post(verifyEmail)

router.route('/resend-verification-email')
.post(resendVerificationEmail)

// Password reset routes
router.route('/forgot-password')
.post(forgotPassword)

router.route('/reset-password/:token')
.post(resetPassword)

router.route('/change-password')
.post(protectedRoute, changePassword)

// Delete account route
router.route('/account/delete')
.delete(protectedRoute, deleteUserAccount)

router.route('/:id')
.get(protectedRoute,getUserById)
.patch(protectedRoute,updateUser)
.delete(protectedRoute,restrictUser("admin"),deleteUser)

router.route('/:id')
.get(protectedRoute,getUserById)
.patch(protectedRoute,restrictUser('admin'),updateUser)
.delete(protectedRoute,restrictUser('admin'),deleteUser)

export default router;
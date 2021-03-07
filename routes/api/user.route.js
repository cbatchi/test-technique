const router = require('express').Router();
const auth = require('../../middlewares/auth')
const authAdmin = require('../../middlewares/auth.admin')
const UserController = require('../../controllers/user.controller');


router.post('/register', UserController.register)
router.post('/activation', UserController.activateEmail)
router.post('/login', UserController.login)
router.post('/refresh_token', UserController.getAccessToken)
router.post('/forgot', UserController.forgotPassword)

router.post('/reset', auth, UserController.resetPassword)
router.get('/info', auth, UserController.getUserInfos)
router.get('/infos', auth, authAdmin, UserController.getUserAllInfos)
router.get('/logout', UserController.logout)


router.patch('/update', auth, UserController.updateUser)
// router.patch('/update_role/:id', auth, authAdmin, UserController.updateUsersRole)

router.delete('/delete/:id', auth, authAdmin, UserController.deleteUser)


module.exports = router;
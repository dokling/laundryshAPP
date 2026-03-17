const express = require('express');
const userAuth = require('../middleware/userAuth.js');
const {adminLogin, createAdmin, isAuthenticated} = require('../controller/adminController.js');
const authRouter = express.Router();

authRouter.post('/create-admin', createAdmin);
authRouter.post('/admin-login', adminLogin);
authRouter.get('/is-auth', userAuth, isAuthenticated);

module.exports = authRouter;
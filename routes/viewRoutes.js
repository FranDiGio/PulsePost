import express from 'express'
import { ensureAuthenticated } from '../services/authService.js'

const router = express.Router()

router.get('/', (req, res) => (req.session.username ? res.redirect('/feed/') : res.render('index.ejs')))
router.get('/feed/', ensureAuthenticated, (req, res) => res.render('feed.ejs', { username: req.session.username }))
router.get('/about/', (req, res) => res.render('about.ejs'))
router.get('/contact/', (req, res) => res.render('contact.ejs'))
router.get('/signup/', (req, res) =>
    res.render('sign-up.ejs', {
        success: false,
        invalidUsername: false,
        invalidEmail: false,
        invalidPassword: false,
    })
)
router.get('/login/', (req, res) => res.render('log-in.ejs', { invalidCredentials: false }))

export default router

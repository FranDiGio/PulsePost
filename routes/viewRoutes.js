import express from 'express'
import { ensureAuthenticated } from '../controllers/authController.js'
import { loadFeed } from '../controllers/viewController.js'

const router = express.Router()

router.get('/', (req, res) => (req.session.username ? res.redirect('/feed/') : res.render('index.ejs')))
router.get('/profile/:username', (req, res) => res.render('profile.ejs', { username: req.params.username }))
router.get('/contact/', (req, res) => res.render('contact.ejs'))
router.get('/about/', (req, res) => res.render('about.ejs'))
router.get('/feed/', ensureAuthenticated, loadFeed)
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

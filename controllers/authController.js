import { auth, db } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from '../services/dateService.js'
import { validateSignUp, checkValidUsername } from '../services/validationService.js'

export function ensureAuthenticated(req, res, next) {
    if (req.session.username) {
        return next()
    } else {
        res.redirect('/login')
    }
}

export async function signUp(req, res) {
    const { username, email, password } = req.body;
    const newUser = { username, email, password };
  
    try {
      const usernameError = await checkValidUsername(username);
      if (usernameError) throw new Error(usernameError);
  
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: username,
        disabled: false
      });
  
      const user = userRecord.toJSON();
      req.session.username = username;
      req.session.userId = user.uid;
  
      await db.ref(`users/${user.uid}`).set({
        username,
        bio: "I'm new here! be nice ;-;",
        profilePicture: 'N/A',
        createdAt: getFormattedDateTime(),
        lastLogged: getFormattedDateTime(),
        following: [],
        followers: []
      });
  
      res.render('sign-up.ejs', { success: true });
    } catch (error) {
      const validationResult = await validateSignUp(newUser, error.code);
      res.render('sign-up.ejs', {
        success: false,
        ...validationResult.invalidFields,
        ...validationResult.invalidMessages,
        username,
        email
      });
      console.log(error.message);
    }
  }

export async function login(req, res) {
    const { email, password } = req.body;
  
    try {
        const userRecord = await auth.getUserByEmail(email);

        req.session.username = userRecord.displayName;
        req.session.userId = userRecord.uid;
    
        await db.ref(`users/${userRecord.uid}`).update({
            lastLogged: getFormattedDateTime()
        });
    
        res.redirect('/feed/');
        } catch (error) {
        res.render('log-in.ejs', {
            invalidCredentials: true,
            email
        });
        console.log(error.message);
    }
}

export async function logOut(req, res) {
    try {
      const userId = req.session.userId;
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Unable to sign out');
        }
        res.redirect('/login');
      });
    } catch (error) {
      console.error('Error during sign-out:', error);
      res.status(500).send('Unable to sign out');
    }
}
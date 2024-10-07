import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import viewRoutes from './routes/viewRoutes.js';
import postRoutes from './routes/postRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(
	session({
		secret: '9qB7n!4@F#5ZwpUJ*3Hg',
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: 'auto',
			maxAge: 24 * 60 * 60 * 1000,
		},
	}),
);

app.set('view engine', 'ejs');

app.use('/api', authRoutes);
app.use('/', settingsRoutes);
app.use('/', postRoutes);
app.use('/', viewRoutes);

app.listen(port, () => {
	console.log('Listening to port ' + port);
});

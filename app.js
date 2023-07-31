require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const passport = require('passport');
const passportConfig = require('./passport_config');
const MongoDBStore = require('connect-mongodb-session')(session);

global.dbConfig = {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    DB: process.env.DB_NAME,
}

global.print = console.log;

require('./mongo_connector')();
const sessionStore = new MongoDBStore({
    uri: `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`,
    databaseName: dbConfig.DB,
    collection: 'sessions',
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
    }
});

const app = express();

const whitelist = ['']
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(null, true);
            //callback(new Error())
        }
    },
    credentials: true
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
passportConfig(passport);
let sess = session({
    key: 'dbc-token',
    secret: process.env.AUTH_SECRET,
    store: sessionStore,
    name: 'dbc-token',
    touchAfter: 24 * 3600, resave: true, saveUninitialized: true, autoRemove: 'native',
    proxy: true,
    cookie: {
        secure: false,
        sameSite: 'none',
        maxAge: new Date().getTime() + (60 * 60 * 24 * 1000 * 7)
    },
});
app.use(sess);
app.use(passport.initialize());
app.use(passport.session());

global.isAdmin = (req, res, next) => {
    if (req.isAuthenticated && req.user && req.user.role === 1) {
        next();
    } else {
        res.status(403).json({'status': 'error', 'message': 'Unauthorized Access'});
    }
}

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const customersRouter = require('./routes/customer');

app.use('/', indexRouter);
app.use('/api/v1/', usersRouter);
app.use('/api/v1/c', customersRouter);

module.exports = app;

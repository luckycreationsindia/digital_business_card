require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const passport = require('passport');
const passportConfig = require('./passport_config');
const MongoDBStore = require('connect-mongodb-session')(session);
const fileUpload = require('express-fileupload');
const s3Manager = require('./services/s3manager');

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
        sameSite: 'lax',
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

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.post('/api/v1/f/upload', isAdmin, (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    req.files = Object.assign({},req.files)['file'];
    let file = req.files.tempFilePath;
    let fileName = req.files.name;
    let ext = getExtension(fileName);
    s3Manager.uploadFile(file, ext, (err, result) => {
        if(err) {
            next(err);
        } else {
            res.send({"status": "Success", "message": result});
        }
    });
});

app.get('/api/v1/f/:file', s3Manager.getFile);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if(err.status && err.status < 100) {
        res.status(200);
    } else if(err.status && err.status >= 100) {
        res.status(parseInt(err.status) || 500);
    } else {
        res.status(500);
    }

    let message = err.message || "Unknown Error";
    if(typeof err == 'string') message = err;
    if(typeof err == 'object') {
        if(err.hasOwnProperty('errors')) {
            let e = err.errors;
            message = "";
            for (const key in e) {
                let m = e[key].message;
                if(!message) message = m;
                else message += ", " + m;
            }
        }
    }
    res.json({"status": "Error", "message": message});
});

function getExtension(filename) {
    let i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substring(i);
}

module.exports = app;

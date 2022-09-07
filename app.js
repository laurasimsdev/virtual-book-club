const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport') 
const session = require('express-session')
const connectDB = require('./config/db')

// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ etended: false}))
app.use(express.json())

// method override
app.use(methodOverride(function(req,res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

// Logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

 
// Handlebars 
app.engine('handlebars', engine({ helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
}, defaultLayout:'main'}));
app.set('view engine', 'handlebars');
app.set("views", "./views");

// Sessions
app.use(session({
    secret:'keyboard cat',
    resave: false,
    saveUninitialized: false
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
 
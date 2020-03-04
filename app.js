var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var methodOverride = require('method-override')
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var db = require('./helper/database');

//  Load routes
var games = require('./routes/games');
var users = require('./routes/users');

//  Load passport
require('./config/passport')(passport);

//  Connect to mongoose
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(function () {
    console.log('mongodb connected');
}).catch(function (err) {
    console.log(err);
});

//  Require method override
app.use(methodOverride('_method'));

//  This code sets up template engine as express handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// create application/json parser
app.use(bodyParser.json());

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

//  Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//  Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//  Setup for flash messaging
app.use(flash());

//  Global variables for flash messaging
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//get route using express handlebars
app.get('/', function (req, res) {
    var title = "Welcome to the Game Library App"
    res.render('index', {
        title: title
    });
});

app.get('/titles', function (req, res) {
    var Game = mongoose.model('games');
    var Users = mongoose.model('users');

    Game.find().then(function (titles) {
        Users.find().then(function (accounts) {

            //  Sort the titles by Game Name
            titles.sort(function (a, b) {
                var x = a.title;
                var y = b.title;
                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0;
            });

            //  For use with accounts 'owning' a game ---ToBeMoved---
            for (var x = 0; x < accounts.length; x++) 
            {
                for (var y = 0; y < titles.length; y++) 
                {
                    if (accounts[x]._id == titles[y].user) 
                    {
                        titles[y].owner = accounts[x].name;
                        console.log(titles[y].user + ', ' + accounts[x]._id);
                    };
                };
            };

            //  Removes duplicates of games listed
            for (var i = 0; i < titles.length; i++) 
            {
                for (var j = titles.length - 1; j > 0; j--) 
                {
                    if (titles[i].title === titles[j].title && i !== j) 
                    {
                        titles[i].owner += ', ' + titles[j].owner;
                        titles.splice(j, 1);
                    };
                };
            };

            //  console.log(titles);

            res.render('gameentry/titles', {
                users: accounts,
                games: titles
            });
        });
    });

    //res.render('gameentry/titles',{
    //    games:db.games
    //});
});

app.get('/about', function (req, res) {
    res.render('about');
});

//  Use our routes
app.use('/game', games);
app.use('/users', users)

//  Connects server to port
var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log("Game Library running on port 5000");
});
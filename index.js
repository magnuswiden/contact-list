var express = require( 'express' );
var app = express();
var engines = require( 'consolidate' );
var sassMiddleware = require( 'node-sass-middleware' );
var path = require( 'path' );
var bodyParser = require( 'body-parser' );
var User = require( './db' ).User;

app.engine( 'hbs', engines.handlebars );
app.set( 'views', './views' );
app.set( 'view engine', 'hbs' );

app.use( sassMiddleware( {
    src: __dirname + '/src/sass/',
    dest: path.join( __dirname, '/public/' ),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css'
} ) );
// Note: you must place sass-middleware *before* `express.static` or else it will
// not work.
app.use( '/public', express.static( path.join( __dirname, 'public' ) ) );
app.use( '/profilepics', express.static( 'public/images' ) );

/* SERVER ROUTES */
app.get( '/', function ( req, res ) {
    res.render( 'index', {} );
} );

app.get( '/users', function ( req, res ) {
    User.find( {}, function ( err, users ) {
        // users.forEach( function ( user ) {
        //     buffer += '<a href="/users/' + user.username + '">' + user.name.full + '</a><br>';
        // } );
        //res.send( buffer );
        res.render( 'users', { users: users } )
    } );
} );

app.get( '/users/:username', function ( req, res ) {
    var username = req.params.username;
    User.findOne( { username: username }, function ( err, user ) {
        //buffer += '<h1>' + user.name.full + '</h1>';
        //res.send( user );
        console.log( typeof user.name.full, typeof user.email );
        res.render( 'user-details', { user: user } );
    } );
} )

var server = app.listen( 4000, function () {
    console.log( 'server running at http://localhost:' + server.address().port );
} );


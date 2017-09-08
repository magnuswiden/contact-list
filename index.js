var express = require( 'express' );
var app = express();
var engines = require( 'consolidate' );
var sassMiddleware = require( 'node-sass-middleware' );
var path = require( 'path' );
var routes = require( './routes' );

app.engine( 'hbs', engines.handlebars );
app.set( 'views', './views' );
app.set( 'view engine', 'hbs' );

app.use( sassMiddleware( {
    src: __dirname + '/src/sass/',
    dest: path.join( __dirname, '/public/' ),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/public'
} ) );

app.use( '/', routes );
app.use( '/public', express.static( path.join( __dirname, 'public' ) ) );
app.use( '/fonts', express.static( 'public/fonts' ) );
app.use( '/profileimages', express.static( 'public/images' ) );




var server = app.listen( 4000, function () {
    console.log( 'server running at http://localhost:' + server.address().port );
} );


var express = require( 'express' );
var router = express();
var User = require( './db' ).User;
var _ = require( 'lodash' );
var bodyParser = require( 'body-parser' );
var methodOverride = require( 'method-override' );

router.use( bodyParser.urlencoded( { extended: true } ) );
router.use( methodOverride( function ( req, res ) {
    if ( req.body && typeof req.body === 'object' && '_method' in req.body ) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
} ) )

/* SERVER ROUTES */
router.get( '/', function ( req, res ) {
    res.render( 'index', {} );
} );

// GET ALL USERS AND DISPLAY THEM I A LIST VIEW
router.get( '/users', function ( req, res ) {
    User.find( {} ).sort( { 'name.first': 1 } ).exec( function ( err, users ) {
        res.render( 'users', { users: users } )
    } );

} );

router.get( '/users/create', function ( req, res ) {
    res.render( 'user-create' );
} );

router.post( '/users/create', function ( req, res ) {
    var updateObject = {
        email: req.body.email,
        cell: req.body.cell,
        salt: req.body.salt,
        name: {
            first: req.body.first,
            last: req.body.last,
            full: _.startCase( req.body.first + " " + req.body.last ),
            title: req.body.title
        }
    }
    var user = new User( updateObject );
    user.save();
    res.redirect( '/users' );
} );

// GET SPECIFIC USER AND DISPLAY DETAILS PAGE
router.get( '/users/:username', function ( req, res ) {
    var username = req.params.username;
    User.findOne( { username: username }, function ( err, user ) {
        res.render( 'user-details', { user: user } );
    } );
} );

// EDIT SPECIFIC USER VIEW
router.get( '/users/:username/edit', function ( req, res ) {
    var username = req.params.username;
    User.findOne( { username: username }, function ( err, user ) {
        res.render( 'user-edit', { user: user } );
    } );
} );

router.put( '/users/:username/edit', function ( req, res ) {
    var username = req.params.username;
    var updateObject = {
        email: req.body.email,
        cell: req.body.cell,
        salt: req.body.salt,
        name: {
            first: req.body.first,
            last: req.body.last,
            full: _.startCase( req.body.first + " " + req.body.last ),
            title: req.body.title
        }
    }
    User.findOneAndUpdate( { username: username }, updateObject, function ( err, user ) {
        res.redirect( '/users/' + username );
    } );
} );

router.delete( '/users/:username/remove', function ( req, res ) {
    var username = req.params.username;
    User.deleteOne( { username: username }, function ( error, writeOpResult ) {
        res.redirect( '/users' );
    } );
} );

router.get( '/raw/:username', function ( req, res ) {
    var username = req.params.username;
    User.findOne( { username: username }, function ( err, user ) {
        res.send( user );
    } );
} );

module.exports = router;
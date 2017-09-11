var express = require( 'express' );
var router = express();
var r = require( 'rethinkdb' );
var connection = null;
r.connect( { host: 'localhost', port: 28015 }, function ( err, conn ) {
    if ( err ) throw err;
    connection = conn;
} );


var _ = require( 'lodash' );
var fileUpload = require( 'express-fileupload' );
var bodyParser = require( 'body-parser' );
var methodOverride = require( 'method-override' );

router.use( fileUpload( { safeFileNames: false } ) );
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
    r.table( 'users' ).orderBy( r.row( 'name' )( 'first' ) ).run( connection, function ( err, cursor ) {
        if ( err ) throw err;
        cursor.toArray( function ( err, users ) {
            if ( err ) throw err;
            res.render( 'users', { users: users } )
            //res.send( JSON.stringify( result, null, 2 ) );
        } );
    } );

} );

router.get( '/users/create', function ( req, res ) {
    res.render( 'user-create' );
} );


router.post( '/users/create', function ( req, res ) {
    if ( !req.files.profileimage ) {
        return res.status( 400 ).send( 'No files were uploaded.' );
    }


    var profileImage = req.files.profileimage;
    // Use the mv() method to place the file somewhere on your server
    var path = './public/images/';
    profileImage.mv( path + profileImage.name, function ( err ) {
        if ( err ) {
            return res.status( 500 ).send( err );
        }
    } );
    var updateObject = {
        email: req.body.email,
        cell: req.body.cell,
        salt: req.body.salt,
        name: {
            first: req.body.first,
            last: req.body.last,
            full: _.startCase( req.body.first + " " + req.body.last ),
            title: req.body.title
        },
        picture: {
            large: '/profileimages/' + profileImage.name
        }
    }
    // var user = new User( updateObject );
    // user.save();
    r.table( "users" ).insert( updateObject ).run( connection, function ( err, response ) {
        if ( err ) throw err;
        res.redirect( '/users' );
    } )
} );

// GET SPECIFIC USER AND DISPLAY DETAILS PAGE
router.get( '/users/:id', function ( req, res ) {
    var id = req.params.id;
    r.table( 'users' ).filter( r.row( 'id' ).eq( id ) ).run( connection, function ( err, cursor ) {
        if ( err ) throw err;
        cursor.toArray( function ( err, user ) {
            if ( err ) throw err;
            res.render( 'user-details', { user: user[ 0 ] } );
        } );
    } );
} );

// EDIT SPECIFIC USER VIEW
router.get( '/users/:id/edit', function ( req, res ) {
    var id = req.params.id;
    r.table( 'users' ).filter( r.row( 'id' ).eq( id ) ).run( connection, function ( err, cursor ) {
        if ( err ) throw err;
        cursor.toArray( function ( err, user ) {
            if ( err ) throw err;
            res.render( 'user-edit', { user: user[ 0 ] } );
        } );
    } );
} );

router.put( '/users/:id/edit', function ( req, res ) {
    var id = req.params.id;
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
    if ( req.files.profileimage ) {
        var profileImage = req.files.profileimage;
        var path = './public/images/';
        profileImage.mv( path + profileImage.name, function ( err ) {
            if ( err ) {
                return res.status( 500 ).send( err );
            }
        } );
        updateObject.picture = {};
        updateObject.picture.large = '/profileimages/' + profileImage.name;
    }
    r.table( "users" ).filter( r.row( 'id' ).eq( id ) ).update( updateObject ).run( connection, function ( err, result ) {
        if ( err ) throw err;
        res.redirect( '/users/' + id );
    } );
} );

router.delete( '/users/:id/remove', function ( req, res ) {
    var id = req.params.id;
    r.table( "users" ).get( id ).delete().run( connection, function ( err, result ) {
        if ( err ) throw err;
        res.redirect( '/users' );
    } );
} );

router.get( '/raw/:id', function ( req, res ) {
    var id = req.params.id;
    r.table( 'users' ).filter( r.row( 'id' ).eq( id ) ).run( connection, function ( err, cursor ) {
        if ( err ) throw err;
        cursor.toArray( function ( err, user ) {
            if ( err ) throw err;
            res.send( JSON.stringify( user, null, 2 ) );
        } );
    } );
} );

module.exports = router;
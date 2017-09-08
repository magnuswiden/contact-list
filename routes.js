var express = require( 'express' );
var router = express();
var User = require( './db' ).User;
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
    User.find( {} ).sort( { 'name.first': 1 } ).exec( function ( err, users ) {
        res.render( 'users', { users: users } )
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
    var user = new User( updateObject );
    user.save();
    res.redirect( '/users' );
} );

// GET SPECIFIC USER AND DISPLAY DETAILS PAGE
router.get( '/users/:id', function ( req, res ) {
    var id = req.params.id;
    User.findOne( { _id: id }, function ( err, user ) {
        res.render( 'user-details', { user: user } );
    } );
} );

// EDIT SPECIFIC USER VIEW
router.get( '/users/:id/edit', function ( req, res ) {
    var id = req.params.id;
    User.findOne( { _id: id }, function ( err, user ) {
        res.render( 'user-edit', { user: user } );
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
    
    User.findOneAndUpdate( { _id: id }, updateObject, function ( err, user ) {
        res.redirect( '/users/' + id );
    } );
} );

router.delete( '/users/:id/remove', function ( req, res ) {
    var id = req.params.id;
    User.deleteOne( { _id: id }, function ( error, writeOpResult ) {
        res.redirect( '/users' );
    } );
} );

router.get( '/raw/:id', function ( req, res ) {
    var id = req.params.id;
    User.findOne( { _id: id }, function ( err, user ) {
        res.send( user );
    } );
} );

module.exports = router;
var express = require( 'express' );
var app = express();
var User = require( './db' ).User;

app.get( '/', function ( req, res ) {
    res.send( 'Yeppa Greppa' );
} );

app.get( '/users', function ( req, res ) {
    var buffer = '<h1>All my Users</h1>';
    User.find( {}, function ( err, users ) {
        users.forEach( function ( user ) {
            buffer += '<a href="/users/' + user.username + '">' + user.name.full + '</a><br>';
        } );
        res.send( buffer );
    } );
} );

app.get( '/users/:username', function ( req, res ) {
    var username = req.params.username;
    var buffer = "";
    User.findOne( { username: username }, function ( err, user ) {
        buffer += '<h1>' + user.name.full + '</h1>';
        res.send( buffer );
    } );
} )

var server = app.listen( 4000, function () {
    console.log( 'server running at http://localhost:' + server.address().port );
} );


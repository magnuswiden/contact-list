var uri = "mongodb://localhost:27020/test";
var mongoose = require( 'mongoose' );
mongoose.connect( uri, { useMongoClient: true } );

var db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'connection error' ) );
db.once( 'open', function () {
    console.log( 'database connected' );
} );

var userSchema = mongoose.Schema( {
    username: String,
    gender: String,
    email: String,
    cell: String,
    salt: String,
    name: {
        title: String,
        first: String,
        last: String,
        full: String
    },
    location: {
        street: String,
        city: String,
        state: String,
        zip: Number
    },
    picture: {
        large: String
    }
} )

exports.User = mongoose.model( 'User', userSchema );

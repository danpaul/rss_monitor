var bcrypt = require('bcrypt');

module.exports = {
    encryptPassword: function(password, callback){
        bcrypt.hash(password, 8, function(err, hash) {
            if( err ){ return callback(err); }
            return callback(null, hash);
        });
    },
    comparePasswords: function(unhashedPassword, hashedPassword, callback){
        bcrypt.compare(unhashedPassword,
                       hashedPassword,
                       function(err, response){

            if( err ){ return callback(err); }
            return callback(null, response);
        })
    }
}
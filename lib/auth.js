module.exports = function(){
    this.isLoggedIn = function(req){
        if( req &&
            req.session &&
            req.session.user &&
            req.session.user.id ){ return true; }
        return false;
    },
    this.getUserId = function(req){
        if( req &&
            req.session &&
            req.session.user &&
            req.session.user.id ){ return req.session.user.id; }
        return null;
    },
    // this.login = function(req, userId){
    //     req.session.userId = userId;
    // },
    this.logout = function(req){
        req.session.destroy();
    },
    this.sendError = function(res){
        res.json({
            status: 'failure',
            message: 'You must be logged in.',
            code: 'userAuthError'
        });
    },
    this.check = function(req, res){
        if( !this.isLoggedIn(req) ){
            this.sendError(res);
            return false;
        }
        return true;
    }
}
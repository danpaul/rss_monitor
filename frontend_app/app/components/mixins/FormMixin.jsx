module.exports = {
    handleInputChange: function(e, callbackIn){
        var callback = callbackIn || function(){};
        var newState = {};
        newState[e.target.name] = e.target.value;
        this.setState(newState, callback);
    }
}
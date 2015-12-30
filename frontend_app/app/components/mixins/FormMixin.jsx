module.exports = {
    handleInputChange: function(e){
        var newState = {};
        newState[e.target.name] = e.target.value;
        this.setState(newState);
    }
}
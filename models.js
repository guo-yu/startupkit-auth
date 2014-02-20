module.exports = function(db, Schema) {
    var userModel = new Schema({
        name: {
            type: String,
            unique: true            
        },
        password: String,
        created: Date,
    });
    return {
        user: db.model('user', userModel)
    }
}
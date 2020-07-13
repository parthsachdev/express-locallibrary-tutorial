var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function() {
        var fullname = '';
        if (this.first_name && this.family_name) {
            fullname = `${this.family_name}, ${this.first_name}`;
        }
        if (!this.first_name || !this.family_name) {
            fullname = '';
        }
        return fullname;
    });

// Virtual for author's lifespan
// AuthorSchema
//     .virtual('lifespan')
//     .get(function() {
//         let date_b = new Date(this.date_of_birth).getFullYear();
//         let date_d = new Date(this.date_of_death).getFullYear();
//         console.log(date_b, date_d)
//         return (parseInt(date_d) - parseInt(date_b)).toString();
//     });

// Virtual for Author's URL
AuthorSchema
    .virtual('url')
    .get(function() {
        return '/catelog/author/' + this._id;
    });

// Export model
module.exports = mongoose.model('Author', AuthorSchema);
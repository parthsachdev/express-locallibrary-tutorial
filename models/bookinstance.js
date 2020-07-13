var mongoose = require('mongoose');
const moment = require('moment');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema ({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    imprint: { type: String, required: true },
    status: { type: String,
                required: true,
                enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
                default: 'Maintenance' },
    due_back: { type: Date, default: Date.now() }
});

// Virtual for bookinstance's url
BookInstanceSchema
    .virtual('url')
    .get(function() {
        return 'catelog/bookinstance/' + this._id;
    });

BookInstanceSchema
    .virtual('due_back_formatted')
    .get(function() {
        return moment(this.due_back).format('MMMM Do, YYYY');
    })

// Export module
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
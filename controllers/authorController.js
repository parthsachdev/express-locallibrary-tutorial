var Author = require('../models/author');       // Author model
var Book = require('../models/book');
var async = require('async');

//  Display list of all authors
exports.author_list = (req, res) => {
    Author.find()
    .populate('author')
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display details for a specific author
exports.author_detail = function (req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
                .populate('author')
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

// Display author create form on get
exports.author_create_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author Create on POST
exports.author_create_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET
exports.author_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle author delete on POST
exports.author_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET
exports.author_update_get = (req, res) => {
    res.send("Author update GET");
};

// Handle author update on POST
exports.author_update_post = (req, res) => {
    res.send("Author update POST");
};
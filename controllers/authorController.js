var Author = require('../models/author');       // Author model
var Book = require('../models/book');
var async = require('async');

const { body, check } = require('express-validator');
const { validationResult } = require('express-validator');

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

//  Display list of all authors
exports.author_list = (req, res, next) => {
    Author.find()
    .populate('author')
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display author create form on get
exports.author_create_get = (req, res, next) => {
    res.render('author_form', { title: 'Create Author' });
};

// Handle Author Create on POST
exports.author_create_post = [
    // Validate fields
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified')
        .isAlphanumeric().withMessage('First name has non-alpha numeric characters'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters'),
    body('date_of_birth', 'Invalid Date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid Date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields
    check('first_name').escape(),
    check('family_name').escape(),
    check('date_of_birth').toDate(),
    check('date_of_death').toDate(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            var { first_name, family_name, date_of_birth, date_of_death } = req.body;
            var author = new Author({ first_name, family_name, date_of_birth, date_of_death });
            author.save(function(err) {
                if (err) { return next(err) }
                res.redirect(author.url)
            });
        }
}];

// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author',
                                        author: results.author,
                                        author_books: results.authors_books } );
    });
};

// Handle author delete on POST
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author',
                                        author: results.author,
                                        author_books: results.authors_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET
exports.author_update_get = (req, res) => {
    res.send("Author update GET");
};

// Handle author update on POST
exports.author_update_post = (req, res) => {
    res.send("Author update POST");
};
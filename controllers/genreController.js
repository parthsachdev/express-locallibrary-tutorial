var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async')

const validator = require('express-validator');


// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find({})
        .sort([['name', 'ascending']])
        .exec(function(err, list_genres) {
            if (err) return next(err);
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(cb) {
            Genre.findById(req.params.id)
                .exec(cb)
        },
        genre_books: function(cb) {
            Book.find({ genre: req.params.id })
                .exec(cb);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.genre == null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', { title: 'Genre detail', genre: results.genre, genre_books: results.genre_books })
    })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre'});
};

// Handle Genre create on POST.
// This approach of using an array is needed, because the
// sanitisers/validators are middleware functions.
exports.genre_create_post = [
    // trim is used to remove trailing or leading whitespaces
    validator.body('name', 'Genre name required: ').trim().isLength({ min: 1 }),
    // the sanitizer helps to escape() any html in the form
    validator.check('name').escape(),
    // process request after validation and sanitization
    (req, res, next) => {
        console.log(`POST request received: ${req.body.name}`)
        // extract the errors
        const errors = validator.validationResult(req);
        var genre = new Genre(
            { name: req.body.name }
        );

        if (!errors.isEmpty()) {
            // If there are error, render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
        } else {
            // data is valid
            Genre.findOne({ name: req.body.name })
                .exec(function(err, found_genre) {
                    if (err) { return next(err) }
                    if (found_genre) {
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function(err) {
                            if (err) return next(err);
                            res.redirect(genre.url);
                        })
                    }
                })
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
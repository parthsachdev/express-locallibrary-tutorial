var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

const { body, validationResult } = require('express-validator');
const { check } = require('express-validator')

var async =  require('async');

exports.index = function(req, res) {
    async.parallel({
        book_count: (cb) => {
            Book.countDocuments({}, cb)
        },
        book_instance_count: (cb) => {
            BookInstance.countDocuments({}, cb);
        },
        book_instance_available_count: (cb) => {
            BookInstance.countDocuments({status: 'Available'}, cb);
        },
        author_count: (cb) => {
            Author.countDocuments({}, cb);
        },
        genre_count: (cb) => {
            Genre.countDocuments({}, cb);
        }
    }, (err, results) => {
        res.render('index', { title: 'Local Library Home', error: err, data: results});
    })
};

// Display list of all books.
// .find will return all the books and select title and
// author among all the fields (including _id and virtual fields)

// .populate('author') will replace the stored book author id
// with full author details
// Display list of all Books.
exports.book_list = function(req, res, next) {

    Book.find({}, 'title author')
      .populate('author')
      .exec(function (err, list_books) {
        console.log(list_books)
        if (err) { return next(err); }
        //Successful, so render
        res.render('book_list', { title: 'Book List', book_list: list_books });
      });

  };

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {

            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {

          BookInstance.find({ 'book': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book',
                                authors: results.authors,
                                genres: results.genres });
    });
};

// Handle book create on POST.
exports.book_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof  req.body.genre==='undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    body('title', 'Title must not be empty').trim().isLength({ min: 1 }),
    body('author', 'Author must not be empty').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    check('*').escape(),

    (req, res, next) => {
        // extract validation results from request
        const errors = validationResult(req);
        var { title, author, summary, isbn, genre } = req.body;
        var book = new Book({ title, author, summary, isbn, genre });
        if (!errors.isEmpty()) {
            async.parallel({
                authors: function(callback) {
                    Author.find();
                },
                genres: function(callback) {
                    Genre.find();
                }
            }, function(err, results) {
                if (err) return next(err);
                for (let i=0; i<results.genre.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book',
                                        authors: results.authors,
                                        genres: results.genres,
                                        book: book,
                                        errors: errors.array() });
            });

        } else {
            book.save(function(err) {
                if (err) { return next(err) }
                res.redirect(book.url);
            })
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    Book.findById(req.params.id)
        .exec((err, book) => {
            if (err) { return next(err) }
            if (book == null) {
                res.redirect('/catelog/books')
            }
            res.render('book_delete', { title: 'Book Author',
                                        book: book });
        })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        Book.findOneAndRemove(req.body.bookid, function (err) {
            if (err) { return next(err); }
            // Success - go to author list
            res.redirect('/catalog/books')
        })
    });};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
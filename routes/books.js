const express = require("express");
const Book = require("../models/book");
const router = new express.Router();
const jsonschema = require("jsonschema");
const newBookSchema = require("../schemas/newBookSchema.json")
const updateBookSchema = require("../schemas/updateBookSchema.json");
const ExpressError = require("../expressError");

/** GET / => {books: [book, ...]}  */
router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id]  => {book: book} */
router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    // Handle the case when the book is not found
    if (err.status === 404) {
      return res.status(404).json({ error: "Book not found" });
    }

    return next(err);
  }
});



/** POST /   bookData => {book: newBook}  */
router.post("/", async function (req, res, next) {
  try{
    const validation = jsonschema.validate(req.body, newBookSchema);
    // console.log(validation);

    if (!validation.valid){
      const listOfErrors = validation.errors.map(e =>e.stack);
      // throw new ExpressError(listOfErrors, 400);
      // const err = new ExpressError(listOfErrors, 400);
      return next(listOfErrors);
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err){
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function(req, res, next) {
  try {
    if ("isbn" in req.body) {
      return next({
        status: 400,
        message: "Not allowed"
      });
    }
    const validation = jsonschema.validate(req.body, updateBookSchema);
    if (!validation.valid) {
      return next({
        status: 400,
        errors: validation.errors.map(e => e.stack)
      });
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({book});
  }

  catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

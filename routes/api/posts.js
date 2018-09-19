//////////////
// Imports //
////////////

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Security
const passport = require('passport');

// Validation
const validatePostInput = require('../../validation/post');

///////////////////
// GET requests //
/////////////////

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: "Posts works" });
});


// @route   GET api/posts/
// @desc    Get all posts
// @access  Private
router.get('/', (req, res) => {
   Post.find().sort({ date: -1 }) // descending order
       .then(posts => res.json(posts))
       .catch(err => res.status(404).json({ nopostfound: 'No posts found'}));
});


// @route   GET api/posts/:id
// @desc    Get a single post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id) // descending order
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'No post found with that ID'}));
});


// @route   POST api/posts/
// @desc    Create a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
        // If any errors, send 400 with errors objects
        return res.status(400).json(errors);
    }

    const newPost = new Post({
       text: req.body.text,
       name: req.body.name,
       avatar: req.body.avatar, // The avatar is coming from the State of the react component
       user: req.user.id
   });

    newPost.save().then((post) => res.json(post));
});


// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }

                    // Delete the post
                    post.remove().then(() => res.json({ deleted: 'success' }));
                })
                .catch(err => res.json(err));
        })
});


// @route   POST api/posts/like/:id
// @desc    Like apost
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check to see if the user already liked the post
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({alreadyliked: 'User already liked this post'});
                    }

                    // Add the user id to the likes array
                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(err => res.json(err));
        })
});

// @route   DELETE api/posts/unlike/:id ... :id being the "post- id", NOT the "like- id"
// @desc    Unlike a post
// @access  Private
router.delete('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check to see if the user already liked the post
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        // If not already liked
                        return res.status(400).json({notliked: 'You have nog liked this post yet'});
                    }

                    // Get to remove index
                    const removeIndex = post.likes.map(items => items.user.toString).indexOf(req.user.id);

                    // Remove the item at the index to remove
                    post.likes.splice(removeIndex, 1);;

                    //
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.json({ nopost: 'There is no post by that id to unlike' }));
        })
});


// @route   POST api/posts/comment/:id ... :id being the "post- id"
// @desc    Post a comment
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
        // If any errors, send 400 with errors objects
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
    .then((post) => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id // The logged in user
            };

        // Add to comments array
        post.comments.push(newComment);

        // Save the post with the new comments
        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});


// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
    '/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then((post) => {
                // Check to see if the comment exists
                if (
                    post.comments.filter(
                        comment => comment.id.toString() === req.params.comment_id)
                        .length === 0
                ) {
                return res
                    .status(404)
                    .json({ commentnotexists: 'Comment does not exist' })
            }

            console.log(post);

            // Get to remove index
            const removeIndex = post.comments
                .map(item => item.id.toString())
                .indexOf(req.params.comment_id);

            // Remove at the index to remove
            post.comments.splice(removeIndex, 1);

            // Save post
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ err }));
});


//////////////
// Exports //
////////////

module.exports = router;

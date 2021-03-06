//////////////
// Imports //
////////////

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// Security
const passport = require('passport');

// Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

///////////////////
// GET requests //
/////////////////

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: "Profile works" });
});


// @route   GET api/profile
// @desc    Get profile of current user
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Create empty errors object
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            // Add error to errors object and pass it with the response
            errors.noProfile = ('There is no profile for this user');
            return res.status(404).json(errors);
        }
        // If succeeded, respond with profile
        res.json(profile);
    })
    // Catch error when reading from database failed
    .catch(err => res.status(400).json(err));
});


// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
    let errors = {};

    Profile.find().populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(profiles.length < 1 || !profiles) {
            errors.noprofiles = 'There are no profiles available';
            return res.status(404).json(errors);
        }

        res.status(200).json(profiles)
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});


// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({ handle: req.params.handle })
    .populate('user', [ 'name', 'avatar' ])
    .then(profile => {
        if(!profile) {
            errors.noprofile = "There is no profile for this user";
            return res.status(404).json(errors);
        }

        res.status(200).json(profile);
    })
    .catch(err => res.status(404).json(err));
});


// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
    .populate('user', [ 'name', 'avatar' ])
    .then(profile => {
        if(!profile) {
            errors.noprofile = "There is no profile for this user";
            return res.status(404).json(errors);
        }

        res.status(200).json(profile);
    })

    .catch(err => res.status(404).json({ profile: 'There is no profile for this user ID' }));
});


// @route   POST api/profile
// @desc    Create or edit profile of current user
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Validate the input of the req.body
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername;
    if (req.body.handle) profileFields.handle = req.body.handle;

    // Skills = array -> Split into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    // Social = Object of fields
    profileFields.social = {};
    (req.body.youtube) ? profileFields.social.youtube = req.body.youtube : profileFields.social.youtube = "";
    (req.body.twitter) ? profileFields.social.twitter = req.body.twitter : profileFields.social.twitter = "";
    (req.body.facebook) ? profileFields.social.facebook = req.body.facebook : profileFields.social.facebook = "";
    (req.body.linkedIn) ? profileFields.social.linkedIn = req.body.linkedIn : profileFields.social.linkedIn = "";
    (req.body.instagram) ? profileFields.social.instagram = req.body.instagram : profileFields.social.instagram = "";

    Profile.findOne({ user: req.user.id }).then(profile => {
        if(profile) {
            // update
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile));
        } else {
            // Create

            // Check if handle exists
            Profile.findOne({ handle: profileFields.handle }).then(profile => {
                if(profile) {
                    errors.handle = 'That handle already exists';
                    res.status(400).json(errors);
                }

                // Save profile
                new Profile(profileFields).save().then(profile => res.json(profile));
            })
        }
    })
});


// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Validate the input of the req.body
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    // Find the profile in question
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // Add to the profile's experience array
        profile.experience.unshift(newExp);

        // Save the profile
        profile.save().then(profile => {
            res.json(profile);
        })
    });
});


// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Validate the input of the req.body
    const { errors, isValid } = validateEducationInput(req.body);

    // Check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    // Find the profile in question
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // Add to the profile's experience array
        profile.education.unshift(newEdu);

        // Save the profile
        profile.save().then(profile => {
            res.json(profile);
        })
    });
});


// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    // Find the profile in question
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        // Search the index to remove by mapping the _id fields
        // from the array of sub documents to an own array of _id fields and
        // Finding the index of the req.params.exp_id
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        if (removeIndex > -1) {
            // Remove at found index
            profile.experience.splice(removeIndex, 1);
        } else {
            errors.noexperience = "There is no experience by that index";
            return res.status(404).json(errors);
        }

        // Save the profile
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});


// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    // Find the profile in question
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        // Search the index to remove by mapping the _id fields
        // from the array of sub documents to an own array of _id fields and
        // Finding the index of the req.params.exp_id
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        if (removeIndex > -1) {
            // Remove at found index
            profile.education.splice(removeIndex, 1);
        } else {
            errors.noeducation = "There is no education by that index";
            return res.status(404).json(errors);
        }

        // Save the profile
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});


// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Find the profile in question
    Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
        User.findOneAndRemove({ _id: req.user.id })
            .then(() => res.status(200).send('User deleted'))
            .catch(err => res.status(400).send(err));
    });
});


//////////////
// Exports //
////////////

module.exports = router;

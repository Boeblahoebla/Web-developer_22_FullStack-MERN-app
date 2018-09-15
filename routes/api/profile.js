//////////////
// Imports //
////////////

const express = require('express');
const router = express.Router();

///////////////////
// GET requests //
/////////////////

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public

router.get('/test', (req, res) => {
    res.json({ msg: "Profile works" });
});

//////////////
// Exports //
////////////

module.exports = router;

'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Resume} = require('./models');
const {User} = require('../users/models');
const passport = require('passport');
const router = express.Router();
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false});


// Auth to check if login id is same as parameter id
function userAuth(req, res, next) {
    Resume.findById(req.params.id)
    .then(resume => {
        if (!resume) return res.status(404).end();
        // console.log('AK' + req.user.username);
        if ((!req.user.admin) && req.user.username !== resume.submitter.username) {
            throw {
                code: 403,
                reason: "NoPermission",
                message: "Not the logged username"
            };
        }
        next();
    })
    .catch(err => {
        console.error(err);
        if (err.code) {
            return res.status(err.code).json(err);
        }
        res.status(500).json({ message: "Internal server error"});
    });   
}

function adminAuth(req, res, next) {
    if (!req.user.admin){
        return res.status(403).json({ 
            code: 403,
            reason: "AdminOnly",
            message: "No admin privilege"
        });
    }
    next();    
}

router.get('/', (req, res)=>{  // No auth required
    return Resume.find().sort('-created')
        .then(resumes => res.status(200).json(resumes))
        .catch(err => res.status(500).json({ message: 'Internal server error'}));

});

router.get('/:id', (req, res)=>{
    Resume.findById(req.params.id)
    .then(resume => {
        res.json(resume);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error"});
    })

});

router.get('/user/:username', (req, res)=>{
    User.findOne({ username: req.params.username })
    .then(user => {
        Resume.find({submitter: user._id}).sort('-created')
        .then(resume => {
            res.json(resume);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error"});
        });
    })
    .catch(err=> {
        console.error(err);
        res.status(500).json( { message: "Internal server error"});
    });
});

// Post a new resume
router.post('/', [jsonParser, jwtAuth], (req, res)=>{
    console.log(req.user.username);
    User.findOne({ username: req.user.username})
    .then(user => {
        //    console.log(4, user);        
        Resume.create({...req.body, ...{ submitter: user._id, created: Date.now(), updated: Date.now(), status: "Submitted" }})
        .then(resume => {
            return res.status(201).json(resume);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: "Internal server error"});
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error"});
    });
});

// Modify a resume
router.put('/:id', [jsonParser, jwtAuth, userAuth], (req, res)=>{
    if (req.body.status)   delete req.body.status;
    Resume.findByIdAndUpdate(req.params.id, 
            {$set: {...req.body}, ...{updated: Date.now()}}, {new: true})
    .then(resume => {
        res.status(203).json(resume);
    })
    .catch(err => {
        res.status(500).json({ message: "Internal server error"});
    });
});

// Modify status: only admin
router.put('/status/:id', [jsonParser, jwtAuth, adminAuth], (req, res)=>{
    const { status } = req.body;
    Resume.findByIdAndUpdate(req.params.id, { $set: { status }}, {new: true})
    .then(resume => res.status(203).json(resume))
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error"});
    });

});

router.delete('/:id', [jwtAuth, userAuth], (req, res)=>{
    Resume.findByIdAndRemove(req.params.id)
    .then(resume => res.status(204).end())
    .catch(err => {
        console.error(4, err);
        res.status(500).json({ message: "Internal server error"});
    });

});

module.exports = { router };
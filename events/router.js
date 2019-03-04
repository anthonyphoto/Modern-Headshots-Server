'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Event} = require('./models');
const {User} = require('../users/models');
const passport = require('passport');
const router = express.Router();
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false});

// Auth to check if subitter id is same as logged id
function userAuth(req, res, next) {
    Event.findById(req.params.id)
    .then(event => {
        if (!event) return res.status(404).end();

        if ((!req.user.admin) && req.user.username !== event.submitter.username) {
            throw {
                code: 403,
                reason: "NoPermission",
                message: "Logged user is different from Submitter"
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
    // console.log(4, req.user);        
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

    return Event.find().sort('-created')
        .then(events => res.status(200).json(events))
        .catch(err => res.status(500).json({ message: 'Internal server error'}));

});

// serch event by event id
router.get('/:id', [jwtAuth, userAuth], (req, res)=>{
    Event.findById(req.params.id)
    .then(event => {
        res.json(event);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error"});
    })

});

// search events by user id
router.get('/user/:userid', [jwtAuth, userAuth], (req, res)=>{
    Event.find({submitter: req.params.userid}).sort('-created')
    .then(event => {
        res.json(event);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error"});
    });
});

// Post a new event (Admin to set "available")
router.post('/', [jsonParser, jwtAuth, adminAuth], (req, res)=>{
    console.log(req.user.username);
    User.findOne({ username: req.user.username})  // User check in case more than 1 admin
    .then(user => {
        Event.create({...req.body, ...{ submitter: user._id, updated: Date.now(), status: "Available" }})
        .then(event => {
            return res.status(201).json(event);
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

// Modify a event (User to book the event for any logged users) - userAuth not required
router.put('/:id', [jsonParser, jwtAuth], (req, res)=>{
    const { shootType, eventTitle, price, specialNote} = req.body;

    Event.findById(req.params.id)
        .then(event=> {
            if (event.status !== 'Available') {
                return Promise.reject({
                    code: 409,  // conflict
                    reason: "Duplicated",
                    message: "Event booked by someone else"
                })
            }    

            return Event.findByIdAndUpdate(req.params.id, 
                {$set: {
                    shootType, eventTitle, price, specialNote,
                    status: 'Booked',
                    submitter: req.user.id,
                    updated: Date.now()
                }}, {new: true});
        })
        .then(event => {
            res.status(203).json(event);
        })
        .catch(err => {
        if (err.code) {
            console.error(err);
            return res.status(err.code).json(err);
        }
        res.status(500).json({ message: "Internal server error"});
        console.error(err.code);
    });
});

// Modify status: only admin or submitter can cancel the event
router.put('/:id/status', [jsonParser, jwtAuth, userAuth], (req, res)=>{
    const { status } = req.body;


    Event.findById(req.params.id)
    .then(event=> {
        // normal users can't cancel the event if status is not booked
        if (!req.user.admin && event.status !== 'Booked') {
            return Promise.reject({
                code: 401,  // conflict
                reason: "Unauthorized",
                message: "Not allowed to cancel"
            })
        }    
        return Event.findByIdAndUpdate(req.params.id, 
                    { $set: { status }}, {new: true});
    })
    .then(event => res.status(203).json(event))
    .catch(err => {
        if (err.code) {
            console.error(err);
            return res.status(err.code).json(err);
        }
        res.status(500).json({ message: "Internal server error"});
        console.error(err.code);
    });
});

// normal users are not allowed to delete events
router.delete('/:id', [jwtAuth, adminAuth], (req, res)=>{
    Event.findByIdAndRemove(req.params.id)
    .then(event => res.status(204).end())
    .catch(err => {
        console.error(4, err);
        res.status(500).json({ message: "Internal server error"});
    });

});

module.exports = { router };
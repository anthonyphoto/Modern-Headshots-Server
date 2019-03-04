"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Photo Event Schema
const eventSchema = mongoose.Schema({
    sessionDate: { type: Date, required: true },
    shootType: String,
    eventTitle: String,
    price: Number,
    status: String,
    updated: { type: Date, Default: Date.now },
    submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photoLink: [String],
    specialNote: String
});

eventSchema.pre('findOne', function(next){
    this.populate('submitter');
    next();
});

eventSchema.pre('find', function(next){
    this.populate('submitter');
    next();
});

eventSchema.methods.serialize = function() {
    return {
        id: this._id,
        sessionDate: this.sessionDate,
        submitter: this.submitter._id,
        firstName: this.submitter.firstName,
        updated: this.updated
    }
};

/*
resumeSchema.virtual("role").get(function(){
    return `admin: ${this.submitter.admin}`;
});
*/
const Event = mongoose.model('Event', eventSchema);  // collections = events
module.exports = { Event };
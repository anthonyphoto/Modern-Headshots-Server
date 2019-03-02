"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Experience Schema in Resume
const expSchema = mongoose.Schema({
    company: String,
    location: String,
    title: String,
    desc: String,
    startYM: String,
    endYM: String
});

// Resume Schema
const resumeSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedIn: String,
    location: String,
    title: String,
    summary: String,
    skill: [String],
    experience: [expSchema],
    education: {
        school: String, 
        location: String,
        degree: String,
        major: String
    },
    created: { type: Date, Default: Date.now },
    updated: { type: Date, Default: Date.now },
    submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
});

resumeSchema.pre('findOne', function(next){
    this.populate('submitter');
    next();
});

resumeSchema.pre('find', function(next){
    this.populate('submitter');
    next();
});

/*
resumeSchema.virtual("role").get(function(){
    return `admin: ${this.submitter.admin}`;
});
*/
const Resume = mongoose.model('Resume', resumeSchema);  // collections = resumes
module.exports = { Resume };
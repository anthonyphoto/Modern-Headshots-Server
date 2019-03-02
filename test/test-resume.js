'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');  // added to generate jwt

const expect = chai.expect;

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { Resume } = require('../resumes');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

let user;
let token;

function seedResumeData() {
  return createTestUser()
        .then(function(user_) {
          user = user_;            
          const id = user._id;
          // console.log('userid', id);
          const seedData = [];
          for (let i = 0; i < 10; i++) {
            seedData.push(generateResumeData(id));
          }
          return Resume.insertMany(seedData);
        });
}

function createTestUser(){
  const usr = {
    username: 'test1',
    password: 'abcdefer3r3r',
    firstName: 'Anthony',
    lastName: 'Kim',
    admin: false,
    recruiter: false
  }
  return User.create(usr);
}

function generateResumeData(id){
  // console.log('id in loop', id);
  return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: "anthony@gmail.com",
      phone: "215-233-2334",
      linkedIn: "http",
      location: "PA",
      lastName: faker.random.words(),
      summary: faker.random.words(),
      skill: [ "C", "C++"],
      experience: '',
      education: {
          school: "Universidy of Florida",
          location: "Gainesville",
          degree: "Computer Engineering",
          major: "Computer Engineering"
      },
      submitter: id,
      status: "Submitted"
  };
}

function tearDownDb() {
  console.warn('Deleting Database');
  return mongoose.connection.dropDatabase();
}

describe("Resume API Resource", function() {
  before(function(){
      return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function(){
    return seedResumeData()
            .then(function(){
              token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
              // console.log(token);
            });
  });

  afterEach(function(){
    //  return;
     return tearDownDb();
  });


  after(function(){
     return closeServer();
  });

  describe("GET endpoint", function() {
      it("should return all existing resume posts", function(){
          let res;
          let resResume;
          return chai.request(app)
              .get('/resumes')
              .then(function(_res) {
                  // console.log(_res.body);
                  res = _res;
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('array');
                  expect(res.body).to.have.lengthOf.at.least(1);
                  return Resume.count();
              })
              .then(function(count){
                console.log('count', count);
                  expect(res.body).to.have.lengthOf(count);
                  resResume = res.body[0];
                  // console.log(4, resResume._id);
                  return Resume.findById(resResume._id);

              })
              .then(function(dbResume){
                  // console.log(dbResume);
                  expect(resResume._id).to.equal(dbResume.id);
                  expect(resResume.title).to.equal(dbResume.title);
                  expect(resResume.firstName).to.equal(dbResume.firstName);
                  expect(resResume.lastName).to.equal(dbResume.lastName);
              });
      });
  });

  describe("POST endpoint", function() {
    it("should add a new resume", function(){
      const newResume = generateResumeData();
      return chai.request(app)
        .post('/resumes')
        .set('Authorization', `Bearer ${token}`)
        .send(newResume)
        .then(function(res) {
          // console.log(res);
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.firstName).to.equal(newResume.firstName);
          expect(res.body.lastName).to.equal(newResume.lastName);
          expect(res.body.title).to.equal(newResume.title);
          return Resume.findById(res.body._id);
        })
        .then(function(dbResume){
          // console.log(dbResume);
          expect(dbResume.title).to.equal(newResume.title);
          expect(dbResume.firstName).to.equal(newResume.firstName);
          expect(dbResume.lastName).to.equal(newResume.lastName);
        });
    });
  });

  describe("PUT endpoint", function() {
    it("should update a resume", function(){
      
      const updateResume = generateResumeData();
      return Resume.findOne()
            .then(function (dbResume){
              updateResume.id = dbResume.id;
              return chai.request(app)
                  .put(`/resumes/${dbResume.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(updateResume)
            })
            .then(function(res){
              expect(res).to.have.status(203);
              return Resume.findById(updateResume.id);
            })
            .then(function(dbResume2){
              expect(dbResume2.title).to.equal(updateResume.title);
              expect(dbResume2.firstName).to.equal(updateResume.firstName);
              expect(dbResume2.lastName).to.equal(updateResume.lastName);
            })
    });
  });

  describe("DELETE endpoint", function() {
    it("should delete a resume", function(){
      let deleteId;
      return Resume.findOne()
            .then(function (dbResume){
              deleteId = dbResume.id;
              return chai.request(app)
                  .delete(`/resumes/${deleteId}`)
                  .set('Authorization', `Bearer ${token}`)
            })
            .then(function(res){
              expect(res).to.have.status(204);
              return Resume.findById(deleteId);
            })
            .then(function(dbResume2){
              expect(dbResume2).to.be.null;
            })
    });
  });
});

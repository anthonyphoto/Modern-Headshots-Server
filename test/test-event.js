'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');  // added to generate jwt

const expect = chai.expect;

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { Event } = require('../events');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

let user;
let token;

function seedEventData() {
  return createTestUser()
        .then(function(user_) {
          user = user_;            
          const id = user._id;
          // console.log('userid', id);
          const seedData = [];
          for (let i = 0; i < 10; i++) {
            seedData.push(generateEventData(id));
          }
          return Event.insertMany(seedData);
        });
}

function createTestUser(){
  const usr = {
    username: 'test1@gmail.com',
    password: 'abcdefer3r3r',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: "215-200-1234",
    admin: true,
  }
  return User.create(usr);
}

function generateEventData(id){
  // console.log('id in loop', id);
  return {
    sessionDate: new Date().setDate(new Date().getDate() + 2),  // get returns only future events
    // new Date"2019-02-13T07:29:55.930Z",
    shootType: faker.random.words(),
    eventTitle: faker.random.words(),
    price: 50,
    status: "Available",
    submitter: id,
    eventPhone: "123-456-7890",
    photoLink: [],
    specialNote: faker.random.words(),
    submitter: id,
    status: "Available"
  };
}

function tearDownDb() {
  console.warn('Deleting Database');
  return mongoose.connection.dropDatabase();
}

describe("Event API Resource", function() {
  before(function(){
      return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function(){
    return seedEventData()
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
      it("should return all existing event posts", function(){
          let res;
          let resEvent;
          return chai.request(app)
              .get('/events')
              .then(function(_res) {
                  // console.log(_res.body);
                  res = _res;
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('array');
                  console.log("res.body", res.body);
                  expect(res.body).to.have.lengthOf.at.least(1);
                  return Event.count();
              })
              .then(function(count){
                console.log('count', count);
                  expect(res.body).to.have.lengthOf(count);
                  resEvent = res.body[0];
                  // console.log(4, resEvent._id);
                  return Event.findById(resEvent._id);

              })
              .then(function(dbEvent){
                  // console.log(dbEvent);
                  expect(resEvent._id).to.equal(dbEvent.id);
                  expect(resEvent.shootType).to.equal(dbEvent.shootType);
                  expect(resEvent.eventTitle).to.equal(dbEvent.eventTitle);
                  expect(resEvent.price).to.equal(dbEvent.price);
                  expect(resEvent.specialNote).to.equal(dbEvent.specialNote);
                  expect(resEvent.status).to.equal(dbEvent.status);
              });
      });
  });

  describe("POST endpoint", function() {
    it("should add a new event", function(){
      const newEvent = generateEventData();
      return chai.request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent)
        .then(function(res) {
          // console.log(res);
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.shootType).to.equal(newEvent.shootType);
          expect(res.body.eventTitle).to.equal(newEvent.eventTitle);
          expect(res.body.specialNote).to.equal(newEvent.specialNote);
          return Event.findById(res.body._id);
        })
        .then(function(dbEvent){
          // console.log(dbEvent);
          expect(dbEvent.specialNote).to.equal(newEvent.specialNote);
          expect(dbEvent.shootType).to.equal(newEvent.shootType);
          expect(dbEvent.eventTitle).to.equal(newEvent.eventTitle);
        });
    });
  });

  describe("PUT endpoint", function() {
    it("should update a event", function(){
      
      const updateEvent = generateEventData();
      return Event.findOne()
            .then(function (dbEvent){
              updateEvent.id = dbEvent.id;
              return chai.request(app)
                  .put(`/events/${dbEvent.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(updateEvent)
            })
            .then(function(res){
              expect(res).to.have.status(203);
              return Event.findById(updateEvent.id);
            })
            .then(function(dbEvent2){
              expect(dbEvent2.shootType).to.equal(updateEvent.shootType);
              expect(dbEvent2.eventTitle).to.equal(updateEvent.eventTitle);
              expect(dbEvent2.spcialNote).to.equal(updateEvent.spcialNote);
            })
    });
  });

  describe("DELETE endpoint", function() {
    it("should delete a event", function(){
      let deleteId;
      return Event.findOne()
            .then(function (dbEvent){
              deleteId = dbEvent.id;
              return chai.request(app)
                  .delete(`/events/${deleteId}`)
                  .set('Authorization', `Bearer ${token}`)
            })
            .then(function(res){
              expect(res).to.have.status(204);
              return Event.findById(deleteId);
            })
            .then(function(dbEvent2){
              expect(dbEvent2).to.be.null;
            })
    });
  });
});

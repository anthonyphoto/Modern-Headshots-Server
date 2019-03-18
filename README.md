## Modern-Headshots

### Demo Link https://modern-headshots.herokuapp.com/   
    Demo Account:  melody@demo.com/demo

##### Server Repo https://github.com/anthonyphoto/Modern-Headshots-Server
##### Client Repo https://github.com/anthonyphoto/Modern-Headshots

### Summary

This is a photographer's web application with an online booking feature.  The users can access photographer's calendar, which shows available timeslots as well as reserved or unavailable slots. Using React's virtual DOM feature, the calendar is rerendered in real-time upon user's action (i.e., timezone update, mouse over on a cell, etc.)  In "My Account" page, the users can view or cancel their future events or can access a personal gallery page from the past events.

### User Stories (Functional)
* As a logged-in user or guest user, I want to access three pages on the app.
    * Landing Page: title and main banner image of the app
    * Into Page: clear instruction of how the program works
    * Schedule Page: photographer's calendar view with avialable/reserved slot
* As a logged-in user or guest user, I want to view the photographer's calendar so I know which timeslots are available to book.  
* As a logged-in user or guest user, I want to change the timezone of the calendar.  The time zone change should be reflected on the page immediately.
* As a logged-in user, I want to make a reservation by clicking an available timeslot.
* As a guest user, once I choose an available slot, I want to be able to resume and complete the reservation process after signing in (or signing up) without leaving the current page
* As a logged-in user, I want to access "My Account" page so I can view my current reservations and past events.
* As a logged-in user, I can cancel my existing reservations.  The cancelled reservation slot shall be shown as "Available" to other users.
* As a logged-in user, I want to access "My Gallery" page from the past events.
* As an admin user, I can modify any user's events.
    * Change the event status ("Available", "Booked", "Done")
    * Add photo links to user's events (Array of URL's shall be stored on event's db record)


### Technology Used
* React/Redux
* Node.js/Express
* MongoDB/Gongoose
* Mocha/Chai/Enzyme/Travis CI
</br></br></br>

### Sample Screenshot (Landing Page)
</br><img width=900 border=1 src='https://anthonyphoto.github.io/Modern-Headshots-Server/public/img/landing.jpg'>
</br></br></br>

### Sample Screenshot (Schedule Page)
</br><img width=900 border=1 src='https://anthonyphoto.github.io/Modern-Headshots-Server/public/img/calendar.jpg'>
</br></br></br>

### Sample Screenshot (My Account Page)
</br><img width=900 border=1 src='https://anthonyphoto.github.io/Modern-Headshots-Server/public/img/myacct.jpg'>
</br></br></br>

### Sample Screenshot (My Gallery Page)
</br><img width=900 border=1 src='https://anthonyphoto.github.io/Modern-Headshots-Server/public/img/mygallery.jpg'>
</br></br></br>

### Sample Screenshot (Mobile View - Intro Page)
</br><img width=400 border=1 src='https://anthonyphoto.github.io/Modern-Headshots-Server/public/img/mobile.jpg'>
</br></br></br>

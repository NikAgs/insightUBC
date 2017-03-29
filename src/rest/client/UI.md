# UI Instructions

### Starting the Application:
#### Process 1
1. Install `concurrently` on `npm` using `npm install -g concurrently`
2. Run the script `yarn start-app` in the main folder

#### Process 2
1. Run the script `yarn start` in the main folder to start the REST server
2. Run the script `yarn start` in the client folder to start the client.

### About the UI
- The UI accomplishes the tasks of finding courses, rooms and scheduling the courses in the rooms. 
- It also integrates Google Maps to show all the Rooms on a Map. 
    - A user can click on the map buttons to schedule classes in a particular building.
- Sorting for the fields can be done by listing out the fields in the order field of the form. 
    - The names of the fields are the same as the names in records i.e. rooms_fullname, courses_number, etc.
    - For fields with course grouping (Pass, Average, Fail and Size) the sorting can be done using the fields `pass`, `fail`, `average` or `size`.
- Schdeuling is done using [scheduleJS](http://bunkat.github.io/schedule/) on the backend 

### Libraries Used
- google-map-react
- lodash
- moment
- react
- react-bootstrap
- react-json-table
- toastr
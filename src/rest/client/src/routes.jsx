import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link, NavLink
} from 'react-router-dom'
import AppContainer from './App';
import Courses from './components/Courses';
import Rooms from './components/Rooms';
import Scheduler from './components/Scheduler';
import Maps from './components/Maps';
// import createBrowserHistory from 'history/createBrowserHistory'
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

const Routes = (
    <Router>
        <div>
            <Navbar collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            UBC Course-Room Allocator
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1}><NavLink to="courses">Courses Explorer</NavLink></NavItem>
                        <NavItem eventKey={1}><NavLink to="maps">UBC Map</NavLink></NavItem>
                        <NavDropdown eventKey={3} title="Rooms" id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1}><NavLink to="rooms">Rooms Explorer</NavLink></MenuItem>
                            <MenuItem eventKey={3.2}><NavLink to="scheduler">Rooms Scheduling</NavLink></MenuItem>
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        <NavItem eventKey={1}>Team 114</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Route exact path="/" component={AppContainer} />
            <Route path="/courses" component={Courses} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/scheduler" component={Scheduler} />
            <Route path="/maps" component={Maps} />
        </div>
    </Router>
);

export default Routes;
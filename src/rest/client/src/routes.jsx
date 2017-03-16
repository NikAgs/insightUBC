import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link, NavLink
} from 'react-router-dom'
import AppContainer from './App';
import Courses from './components/Courses';
import Rooms from './components/Rooms';
import createBrowserHistory from 'history/createBrowserHistory'
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

const history = createBrowserHistory()



const Routes = (
    <Router>
        <div>
            <Navbar collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <NavLink to="/">
                            UBC Course-Room Allocator
                        </NavLink>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1}><NavLink to="courses">Courses Explorer</NavLink></NavItem>
                        <NavDropdown eventKey={3} title="Rooms" id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1}>Rooms Explorer</MenuItem>
                            <MenuItem eventKey={3.2}>Rooms Scheduling</MenuItem>
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        <NavItem eventKey={1}>Team 114</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Route exact path="/" component={AppContainer} />
            <Route path="/courses" component={Courses} />
        </div>
    </Router>
);

export default Routes;
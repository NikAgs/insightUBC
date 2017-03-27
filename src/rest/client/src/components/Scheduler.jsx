import React, { Component } from 'react';
import { Grid, Col, ListGroup, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import JsonTable from 'react-json-table';
import TimeTable from './Timetable';
import toastr from 'toastr'

export default class Scheduler extends Component {

    constructor(props) {
        super(props);
        this.getSchedule = this.getSchedule.bind(this);
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.state = { selectedQuery: "AND", showQuery: true };
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.buildQuery = this.buildQuery.bind(this);
    }

    buildQuery() {
        let queryObj = {};
        let courseNumber = this.title.value || null;
        let dept = this.department.value || null;
        let fullname = this.fullname.value || null;
        let shortname = this.shortname.value || null;
        let distance = parseInt(this.location.value) || null;
        if (fullname) {
            queryObj.buildingName = fullname;
            queryObj.buildingQuery = {
                "rooms_fullname": fullname
            }
        } else {
            queryObj.buildingName = shortname;
            queryObj.buildingQuery = {
                "rooms_shortname": shortname
            }
        }
        if (courseNumber) {
            queryObj.courseNumber = courseNumber;
        }
        if (dept) {
            queryObj.department = dept;
        }
        if (distance) {
            queryObj.distance = distance;
        }
        if (courseNumber && dept) {
            queryObj.type = this.state.selectedQuery;
        }
        return queryObj;
    }

    getSchedule(event) {
        event.preventDefault();
        let self = this;
        let finalQueryObj = this.buildQuery();
        // data.append("json", JSON.stringify(testObj));
        console.log(finalQueryObj);
        fetch('http://localhost:4321/schedule', {
            method: "POST",
            body: JSON.stringify(finalQueryObj)
        })
            .then((res) => { return res.json(); })
            .then((data) => {
                console.log(data);
                if (data.rooms) {
                    self.setState({
                        rooms: data.rooms,
                        courses: data.courses,
                        scheduledTasks: data.schedule.scheduledTasks,
                        failedTasks: data.schedule.failedTasks,
                        showQuery: false
                    })
                }
                else {
                    toastr.error(data.error);
                }
            })
    }

    handleButtonClick(event) {
        event.preventDefault();
        this.setState({ showQuery: true });
    }


    handleQueryChange(changeEvent) {
        this.setState({
            selectedQuery: changeEvent.target.value
        });
    }


    render() {
        const formBody = (
            <div>
                <form className="form-horizontal" onSubmit={this.getSchedule}>
                    <fieldset>
                        <ListGroup>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Course Number</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.title = ref} placeholder='Course Number' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Department</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.department = ref} placeholder='Department Code' className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </ListGroupItem>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Building Fullname</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.fullname = ref} placeholder='Fullname' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Building Shortname</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.shortname = ref} placeholder='Shortname' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Maximum Distance</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='number' name='name' ref={ref => this.location = ref} placeholder='Meters' className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </ListGroupItem>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Query Type:</label>
                                        <div className="col-sm-8 col-md-9">
                                            <label className="radio-inline">
                                                <input type="radio" name="queryRadio"
                                                    value='AND'
                                                    checked={this.state.selectedQuery === 'AND'}
                                                    onChange={this.handleQueryChange} />
                                                AND
									        </label>
                                            <label className="radio-inline">
                                                <input type="radio" name="queryRadio"
                                                    value='OR'
                                                    checked={this.state.selectedQuery === 'OR'}
                                                    onChange={this.handleQueryChange} />
                                                OR
									        </label>
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <div className=" col-xs-12 text-center">
                                            <input type="submit" className="btn btn-success" />
                                        </div>
                                    </div>
                                </div>
                            </ListGroupItem>
                        </ListGroup>
                    </fieldset>

                </form>
            </div>
        )
        const searchButton = (
            <ListGroup className="text-right">
                <Button onClick={this.handleButtonClick}>New Query</Button>
            </ListGroup>
        )
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    {
                        this.state.showQuery ? formBody : searchButton
                    }
                    <TimeTable rooms={this.state.rooms} courses={this.state.courses} scheduledTasks={this.state.scheduledTasks} failed={this.state.faiiledTasks} />
                </Col>
            </Grid>
        );
    }
}

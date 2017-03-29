import React, { Component } from 'react';
import MyGreatPlace from './MyGreatPlace.jsx'
import GoogleMap from 'google-map-react';
import toastr from 'toastr';
let _ = require('lodash');
import { Modal, Grid, Button, Row, Col, ListGroup } from 'react-bootstrap';
import JsonTable from 'react-json-table';
import TimeTable from './Timetable';

class Maps extends Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            center: { lat: 49.265831, lng: -123.2527027 },
            zoom: 15,
            hoverKey: null,
            selectedQuery: "AND",
            showModal: false
        }
        this.renderMarkers = this.renderMarkers.bind(this);
        this.onChildClick = this.onChildClick.bind(this);
        this.onChildMouseEnter = this.onChildMouseEnter.bind(this);
        this.onChildMouseLeave = this.onChildMouseLeave.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.scheduleCourses = this.scheduleCourses.bind(this);
        this.buildQuery = this.buildQuery.bind(this);
        this.goBack = this.goBack.bind(this);
        this.handleQueryChange = this.handleQueryChange.bind(this);
    }

    componentDidMount() {
        let self = this;
        let finalQueryObj = {
            WHERE: {},
            OPTIONS: {
                FORM: "TABLE",
                COLUMNS: ["rooms_lat", "rooms_lon", "rooms_fullname", "rooms_shortname"]
            }
        }
        fetch('http://localhost:4321/query', {
            method: "POST",
            body: JSON.stringify(finalQueryObj)
        })
            .then((res) => { return res.json(); })
            .then((data) => {
                console.log(data);
                if (data && data.render === "TABLE") {
                    let uniqueBuildings = _.uniqBy(data.result, 'rooms_shortname')
                    self.setState({
                        ans: uniqueBuildings
                    })
                }
                else {
                    toastr.error(data.error);
                }
            })
    }

    renderMarkers(visitObj, id) {
        return (
            <MyGreatPlace
                key={visitObj.rooms_shortname} lat={visitObj.rooms_lat}
                lng={visitObj.rooms_lon}
                text={visitObj.rooms_shortname}
                obj={visitObj}
                hover={this.state.hoverKey == visitObj.rooms_shortname} />
        )
    }

    onChildMouseEnter(key /*, childProps */) {
        this.setState({
            hoverKey: key
        });
    }

    onChildMouseLeave() {
        this.setState({
            hoverKey: null
        });
    }

    onChildClick(key, childProps) {
        // console.log(childProps);
        let self = this;
        let finalQueryObj = {
            WHERE: {
                IS: {
                    "rooms_shortname": childProps.obj.rooms_shortname
                }
            },
            OPTIONS: {
                FORM: "TABLE",
                COLUMNS: ["rooms_number", "rooms_seats", "rooms_type", "rooms_furniture"]
            }
        }
        fetch('http://localhost:4321/query', {
            method: "POST",
            body: JSON.stringify(finalQueryObj)
        })
            .then((res) => { return res.json(); })
            .then((data) => {
                console.log(data);
                if (data && data.render === "TABLE") {
                    self.setState({
                        roomsOfBuilding: data.result,
                    })
                }
                else {
                    toastr.error(data.error);
                }
            })
        this.open();
        this.setState({ modalData: childProps });
    }

    close() {
        this.setState({ showModal: false });
    }
    open() {
        this.setState({ showModal: true });
    }
    goBack() {
        this.setState({
            rooms: null
        })
    }

    buildQuery() {
        let queryObj = {};
        let courseNumber = this.title.value || null;
        let dept = this.department.value || null;
        let fullname = this.state.modalData.obj.rooms_fullname;
        if (fullname) {
            queryObj.buildingName = fullname;
            queryObj.buildingQuery = {
                "rooms_fullname": fullname
            }
        }
        if (courseNumber) {
            queryObj.courseNumber = courseNumber;
        }
        if (dept) {
            queryObj.department = dept;
        }
        if (courseNumber && dept) {
            queryObj.type = this.state.selectedQuery;
        }
        return queryObj;
    }

    scheduleCourses(event) {
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
                    })
                    self.close();
                }
                else {
                    toastr.error(data.error);
                }
            })
    }

    handleQueryChange(changeEvent) {
        this.setState({
            selectedQuery: changeEvent.target.value
        });
    }

    render() {
        let modalBody = null;
        let modalHeading = null;
        if (this.state.modalData) {
            modalHeading = this.state.modalData.obj.rooms_fullname
            modalBody = (
                <Row>
                    <Col xs={8}>
                        <div className="table-responsive">
                            <JsonTable className="table" rows={this.state.roomsOfBuilding} />
                        </div>
                    </Col>
                    <Col xs={4}>
                        <h3>Schedule Courses</h3>
                        <form className="form-horizontal" onSubmit={this.scheduleCourses} >
                            <fieldset>
                                <div className="row">
                                    <div className="form-group col-sm-12">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Course Number</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.title = ref} placeholder='Course Number' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-12">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Dept</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.department = ref} placeholder='Department Code' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-12">
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
                                    <div className="form-group col-sm-12">
                                        <div className=" col-xs-12 text-center">
                                            <input type="submit" className="btn btn-success" />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </form>
                    </Col>
                </Row>
            )
        }
        let timeTableDiv = (
            <div>
                <ListGroup className="text-left">
                    <Button onClick={this.goBack}> <span className="glyphicon glyphicon-arrow-left"></span></Button>
                </ListGroup>
                <TimeTable rooms={this.state.rooms} courses={this.state.courses} scheduledTasks={this.state.scheduledTasks} failed={this.state.faiiledTasks} />
            </div>
        )
        let mapsDiv = (
            <div>
                <Modal show={this.state.showModal} bsSize="large" onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {modalBody}
                    </Modal.Body>
                </Modal>
                <div id="googleMap" style={{ height: 500 + 'px' }}>
                    <GoogleMap
                        center={this.state.center}
                        defaultZoom={this.state.zoom}
                        onChildClick={this.onChildClick}
                        onChildMouseEnter={this.onChildMouseEnter}
                        onChildMouseLeave={this.onChildMouseLeave}
                    >
                        {this.state.ans &&
                            this.state.ans.map(this.renderMarkers)}
                    </GoogleMap>
                </div>
            </div>
        )
        return (
            <Grid>
                {this.state.rooms ?
                    timeTableDiv : mapsDiv
                }
            </Grid>
        )
    }
}

export default Maps;
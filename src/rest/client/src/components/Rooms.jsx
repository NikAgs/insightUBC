import React, { Component } from 'react';
import { Grid, Col, ListGroup, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import JsonTable from 'react-json-table';
import toastr from 'toastr'

export default class Rooms extends Component {

    constructor(props) {
        super(props);
        this.searchRooms = this.searchRooms.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.getList = this.getList.bind(this);
        this.state = {
            selectedOption: "UP",
            selectedQuery: "AND",
            ans: [],
            showQuery: true,
            findLocationBound: false
        };
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    buildQuery() {
        let fullname = this.fullname.value || null;
        let shortname = this.shortname.value || null;
        let size = parseInt(this.size.value) || null;
        let number = this.number.value || null;
        let location = parseInt(this.location.value) || null;
        let furniture = this.furniture.value || null;
        let rtype = parseInt(this.rtype.value) || null;
        let order = this.state.selectedOption || "UP";
        let orderArr = this.order.value.split(", ");
        if (orderArr[0] == "") {
            orderArr = null;
        }
        let finalQueryObj = {};
        finalQueryObj.OPTIONS = {};
        finalQueryObj.OPTIONS.COLUMNS = this.getList();
        let orderObj = "";
        let filters = [];
        if (furniture) {
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_furniture = furniture;
            filters.push(tObj);
        }
        if (rtype) {
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_type = rtype;
            filters.push(tObj);
        }
        if (!location) {
            if (fullname) {
                let tObj = {};
                tObj.IS = {};
                tObj.IS.rooms_fullname = fullname;
                filters.push(tObj);
            }
            if (shortname) {
                let tObj = {};
                tObj.IS = {};
                tObj.IS.rooms_shortname = shortname;
                filters.push(tObj);
            }
        } else {
            let buildingName = fullname ? fullname : shortname;
            this.setState({ findLocationBound: true, buildingName: buildingName });
            finalQueryObj.OPTIONS.COLUMNS = finalQueryObj.OPTIONS.COLUMNS.concat(["rooms_lat", "rooms_lon"]);
        }
        if (number) {
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_number = number;
            filters.push(tObj);
        }
        if (size) {
            //size does not exist for courses
            let tObj = {};
            tObj.GT = {};
            tObj.GT.rooms_seats = size;
            filters.push(tObj);
        }
        if (orderArr) {
            orderObj = {};
            orderObj.dir = order;
            orderObj.keys = orderArr;
        }
        finalQueryObj.OPTIONS.ORDER = orderObj;
        finalQueryObj.OPTIONS.FORM = "TABLE";
        finalQueryObj.WHERE = {};
        if (filters.length > 1) {
            let type = this.state.selectedQuery;
            finalQueryObj.WHERE[type] = filters;
        }
        else if (filters.length == 1) {
            finalQueryObj.WHERE = filters[0];
        }
        return finalQueryObj;
    }

    filterByLocation(array, buildingName) {
        return array;
    }

    searchRooms(event) {
        event.preventDefault();
        let self = this;
        let finalQueryObj = this.buildQuery();
        // data.append("json", JSON.stringify(testObj));
        console.log(this.state.findLocationBound);
        if (parseInt(this.location.value) > 0) {
            let testObj = {};
            let fullname = this.fullname.value || null;
            let shortname = this.shortname.value || null;
            testObj.query = finalQueryObj;
            testObj.buildingName = fullname ? fullname : shortname;
            testObj.maxDistance = this.location.value;
            fetch('http://localhost:4321/distanceQuery', {
                method: "POST",
                body: JSON.stringify(testObj)
            })
                .then((res) => { return res.json(); })
                .then((data) => {
                    console.log(data);
                    if (data && data.render === "TABLE") {
                        self.setState({
                            ans: data.result,
                            showQuery: false
                        });
                    }
                    else {
                        toastr.error(data.error);
                    }
                })
        }
        else {
            fetch('http://localhost:4321/query', {
                method: "POST",
                body: JSON.stringify(finalQueryObj)
            })
                .then((res) => { return res.json(); })
                .then((data) => {
                    console.log(data);
                    if (data && data.render === "TABLE") {
                        self.setState({
                            ans: data.result,
                            showQuery: false
                        })
                    }
                    else {
                        toastr.error(data.error);
                    }
                })
        }
        this.form.value = "";
    }


    getList() {
        let columnsArr = [];
        this.sdepartment.checked && columnsArr.push("rooms_fullname");
        this.sid.checked && columnsArr.push("rooms_shortname");
        this.savg.checked && columnsArr.push("rooms_number");
        this.sinstructor.checked && columnsArr.push("rooms_name");
        this.stitle.checked && columnsArr.push("rooms_address");
        this.sfail.checked && columnsArr.push("rooms_seats");
        this.saudit.checked && columnsArr.push("rooms_type");
        this.syear.checked && columnsArr.push("rooms_furniture");
        return columnsArr;
    }

    handleOptionChange(changeEvent) {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    }

    handleQueryChange(changeEvent) {
        this.setState({
            selectedQuery: changeEvent.target.value
        });
    }

    handleButtonClick(event) {
        event.preventDefault();
        this.setState({ showQuery: true });
    }

    render() {
        const formBody = (
            <div>
                <form className="form-horizontal" ref={ref => this.form = ref} onSubmit={this.searchRooms}>
                    <fieldset>
                        <ListGroup>
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
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Room Number</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.number = ref} placeholder='Number' className="form-control" />
                                        </div>
                                    </div>

                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Seats</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.size = ref} placeholder='Seats over...' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Furniture Type</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.furniture = ref} placeholder='Furniture Type' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Room Type</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='number' name='name' ref={ref => this.rtype = ref} placeholder='Room Type' className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </ListGroupItem>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Order By:</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.order = ref} placeholder='Seperated By Comma' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Type:</label>
                                        <div className="col-sm-8 col-md-9">
                                            <label className="radio-inline">
                                                <input type="radio" name="orderRadio"
                                                    value='UP'
                                                    checked={this.state.selectedOption === 'UP'}
                                                    onChange={this.handleOptionChange} />
                                                Ascending
									</label>
                                            <label className="radio-inline">
                                                <input type="radio" name="orderRadio"
                                                    value='DOWN'
                                                    checked={this.state.selectedOption === 'DOWN'}
                                                    onChange={this.handleOptionChange} />
                                                Descending
									</label>
                                        </div>
                                    </div>

                                </div>
                            </ListGroupItem>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-3 col-md-2">Details:</label>
                                        <div className=" col-sm-9 col-md-10">
                                            <Checkbox inline inline inputRef={ref => { this.sdepartment = ref; }}>
                                                Full Name </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.sid = ref; }}>
                                                Short Name </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.savg = ref; }}>
                                                Room Number </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.sinstructor = ref; }}>
                                                Room Name </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.sfail = ref; }}>
                                                Seats </Checkbox>
                                            <Checkbox inline inputRef={ref => { this.stitle = ref; }}>
                                                Address </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.saudit = ref; }}>
                                                Type </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.syear = ref; }}>
                                                Furniture </Checkbox>
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-3">
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
                                    <div className="form-group col-sm-3">
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
                    <div className="table-responsive">
                        <JsonTable className="table" rows={this.state.ans} />
                    </div>
                </Col>
            </Grid>
        );
    }
}

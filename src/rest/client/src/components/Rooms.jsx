import React, { Component } from 'react';
import { Grid, Col, ListGroup, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import JsonTable from 'react-json-table';

export default class Rooms extends Component {

    constructor(props) {
        super(props);
        this.searchRooms = this.searchRooms.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.getList = this.getList.bind(this);
        this.state = { selectedOption: "UP", ans: [], showQuery: true };
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
        let orderObj = "";
        let filters = [];
        if (furniture) {
            furniture = "*" + furniture + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_furniture = furniture;
            filters.push(tObj);
        }
        if (rtype) {
            rtype = "*" + rtype + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_type = rtype;
            filters.push(tObj);
        }
        if (fullname) {
            fullname = "*" + fullname + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_fullname = fullname;
            filters.push(tObj);
        }
        if (shortname) {
            shortname = "*" + shortname + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_shortname = shortname;
            filters.push(tObj);
        }
        if (number) {
            let tObj = {};
            tObj.IS = {};
            tObj.IS.rooms_number = number;
            filters.push(tObj);
        }
        if (size) {
            //size does not exist for courses
        }
        if (orderArr) {
            orderObj = {};
            orderObj.dir = order;
            orderObj.keys = orderArr;
        }
        let finalQueryObj = {};
        finalQueryObj.OPTIONS = {};
        finalQueryObj.OPTIONS.ORDER = orderObj;
        finalQueryObj.OPTIONS.FORM = "TABLE";
        finalQueryObj.OPTIONS.COLUMNS = this.getList();
        finalQueryObj.WHERE = {};
        if (filters.length > 1) {
            finalQueryObj.WHERE.AND = filters;
        }
        else {
            finalQueryObj.WHERE = filters[0];
        }
        return finalQueryObj;
    }

    searchRooms(event) {
        event.preventDefault();
        let self = this;
        let finalQueryObj = this.buildQuery();
        // data.append("json", JSON.stringify(testObj));
        console.log(finalQueryObj);
        let testObj = {
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_furniture",
                    "rooms_href"
                ],
                "FORM": "TABLE"
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
                        ans: data.result,
                        showQuery: false
                    })
                }
            })
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

    handleButtonClick(event) {
        event.preventDefault();
        this.setState({ showQuery: true });
    }

    render() {
        const formBody = (
            <div>
                <form className="form-horizontal" onSubmit={this.searchRooms}>
                    <fieldset>
                        <ListGroup>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Room Fullname</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.fullname = ref} placeholder='Fullname' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Shortname</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.shortname = ref} placeholder='Shortname' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Room Number</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.number = ref} placeholder='Number' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Location</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='number' name='name' ref={ref => this.location = ref} placeholder='Meters' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Size</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.size = ref} placeholder='Size' className="form-control" />
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
                    <div className="table-responsive">
                        <JsonTable className="table" rows={this.state.ans} />
                    </div>
                </Col>
            </Grid>
        );
    }
}

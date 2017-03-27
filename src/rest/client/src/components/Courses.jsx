import React, { Component } from 'react';
import { Grid, Col, ListGroup, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import JsonTable from 'react-json-table';

export default class Courses extends Component {

    constructor(props) {
        super(props);
        this.searchCourse = this.searchCourse.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.getList = this.getList.bind(this);
        this.state = { selectedOption: "UP", selectedQuery: "AND", ans: [], showQuery: true };
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.buildQuery = this.buildQuery.bind(this);
    }

    buildQuery() {
        let courseTitle = this.title.value || null;
        let dept = this.department.value || null;
        let size = parseInt(this.size.value) || null;
        let instructor = this.instructor.value || null;
        let order = this.state.selectedOption || "UP";
        let orderArr = this.order.value.split(", ");
        let groupBy = this.groupSection.checked;
        if (orderArr[0] == "") {
            orderArr = null;
        }
        let orderObj = "";
        let filters = [];
        if (courseTitle) {
            courseTitle = "*" + courseTitle + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.courses_title = courseTitle;
            filters.push(tObj);
        }
        if (instructor) {
            instructor = "*" + instructor + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.courses_instructor = instructor;
            filters.push(tObj);
        }
        if (dept) {
            dept = "*" + dept + "*";
            let tObj = {};
            tObj.IS = {};
            tObj.IS.courses_dept = dept;
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
        if (groupBy) {
            finalQueryObj.TRANSFORMATIONS = {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": []
            }
        }
        if (filters.length > 1) {
            let type = this.state.selectedQuery;
            finalQueryObj.WHERE[type] = filters;
        }
        else if (filters.length == 1) {
            finalQueryObj.WHERE = filters[0];
        }
        return finalQueryObj;
    }

    searchCourse(event) {
        event.preventDefault();
        let self = this;
        let finalQueryObj = this.buildQuery();
        // data.append("json", JSON.stringify(testObj));
        console.log(finalQueryObj);
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
        this.sdepartment.checked && columnsArr.push("courses_dept");
        this.sid.checked && columnsArr.push("courses_id");
        this.savg.checked && columnsArr.push("courses_avg");
        this.sinstructor.checked && columnsArr.push("courses_instructor");
        this.stitle.checked && columnsArr.push("courses_title");
        this.spass.checked && columnsArr.push("courses_pass");
        this.sfail.checked && columnsArr.push("courses_fail");
        this.saudit.checked && columnsArr.push("courses_audit");
        this.syear.checked && columnsArr.push("courses_year");
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


    handleQueryChange(changeEvent) {
        this.setState({
            selectedQuery: changeEvent.target.value
        });
    }


    render() {
        const formBody = (
            <div>
                <form className="form-horizontal" onSubmit={this.searchCourse}>
                    <fieldset>
                        <ListGroup>
                            <ListGroupItem>
                                <div className="row">
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Course Title</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.title = ref} placeholder='Title' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Department</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.department = ref} placeholder='Department Code' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Instructor Name</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='text' name='name' ref={ref => this.instructor = ref} placeholder='Name' className="form-control" />
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Size</label>
                                        <div className="col-sm-8 col-md-9">
                                            <input type='number' name='name' ref={ref => this.size = ref} placeholder='Size' className="form-control" />
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
                                    <div className="form-group col-sm-5">
                                        <label className="control-label text-semibold col-sm-3 col-md-2">Details:</label>
                                        <div className=" col-sm-9 col-md-10">
                                            <Checkbox inline inputRef={ref => { this.stitle = ref; }}>
                                                Title </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.sdepartment = ref; }}>
                                                Department </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.sid = ref; }}>
                                                ID </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.savg = ref; }}>
                                                Avergae </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.sinstructor = ref; }}>
                                                Instructors </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.spass = ref; }}>
                                                Pass </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.sfail = ref; }}>
                                                Fail </Checkbox>
                                            <Checkbox inline inline inputRef={ref => { this.saudit = ref; }}>
                                                Audit </Checkbox>
                                            <Checkbox inline  inputRef={ref => { this.syear = ref; }}>
                                                Year </Checkbox>
                                        </div>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label className="control-label text-semibold col-sm-6 col-md-4">Query Type:</label>
                                        <div className="col-sm-6 col-md-8">
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
                                        <label className="control-label text-semibold col-sm-6 col-md-6">Group Sections:</label>
                                        <div className=" col-sm-6 col-md-6">
                                            <Checkbox inline inputRef={ref => { this.groupSection = ref; }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group col-sm-12">
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
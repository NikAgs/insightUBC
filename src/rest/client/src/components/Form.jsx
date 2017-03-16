import React, { Component } from 'react';
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap';

export default class Form extends Component {

    constructor(props) {
        super(props);
        this.searchCourse = this.searchCourse.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.state = { selectedOption: "UP" }
    }

    searchCourse(event) {
        event.preventDefault();
        let courseTitle = this.title.value || null;
        let dept = this.department.value || null;
        let size = parseInt(this.size.value) || null;
        let instructor = this.instructor.value || null;
        let order = this.state.selectedOption || "UP";
        let orderArr = this.order.value.split(",") || [];
        let orderObj = {};
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
        if (orderArr.length > 0) {
            orderObj.dir = order;
            orderObj.keys = orderArr;
        }
        let finalQueryObj = {};
        finalQueryObj.OPTIONS = {};
        finalQueryObj.OPTIONS.ORDER = orderObj;
        finalQueryObj.OPTIONS.FORM = "TABLE";
        finalQueryObj.WHERE = {};
        if (filters.length > 1) {
            finalQueryObj.WHERE.AND = filters;
        }
        else {
            finalQueryObj.WHERE = filters[0];
        }
        console.log(finalQueryObj);
        return;
    }

    handleOptionChange(changeEvent) {
        this.setState({
            selectedOption: changeEvent.target.value
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
                                    <div className="form-group col-sm-6">
                                        <label className="control-label text-semibold col-sm-4 col-md-3">Details:</label>
                                        <div className=" col-sm-8 col-md-9">
                                            <select name='selectedDetail' ref={ref => this.details = ref} className="form-control">
                                                <option value=""></option>
                                                <option value="admin" name="Admin">
                                                    Courses</option>
                                                <option value="client" name="client">
                                                    Sections</option>
                                            </select>
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
        return (
            <Grid fluid={true}>
                {formBody}
            </Grid>
        );
    }
}

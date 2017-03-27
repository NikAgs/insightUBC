import React, { Component } from 'react';
import { Grid, Col, ListGroup, Table, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import Moment from 'react-moment';
let _ = require('lodash');

export default class QualityTable extends Component {

    constructor(props) {
        super(props);
        this.renderTable = this.renderTable.bind(this);
        this.renderCourses = this.renderCourses.bind(this);
    }


    renderTable(courseId) {
        // console.log(sObj);
        let courseInfo;
        const courses = this.props.courses;
        courses.forEach((course) => {
            if (_.includes(courseId, course["courseId"])) {
                courseInfo = course;
            }
        })

        if (courseInfo) {
            return (
                <tr key={courseId}>
                    <td> {courseInfo && courseInfo.size} </td>
                </tr>
            );
        }
    }

    renderCourses(courseObj) {
        return (
            <tr key={courseObj.courseId}>
                <td> {courseObj.courseId} </td>
                <td> {courseObj.sections} </td>
                <td> {courseObj.size} </td>
            </tr>
        );
    }


    render() {
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    <Table>
                        <thead>
                            <tr>
                                <td>Course Name</td>
                                <td>Number of Sections</td>
                                <td>Size</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.courses &&
                                this.props.courses.map(this.renderCourses)}
                        </tbody>
                    </Table>
                </Col>
                <Col xs={12}>
                    <div className="table-responsive">
                        {this.props.failed &&
                            this.props.failed.map(this.renderTable)}
                    </div>
                </Col>
            </Grid>
        );
    }
}

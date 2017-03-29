import React, { Component } from 'react';
import { Grid, Col, ListGroup, Table, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import Moment from 'react-moment';
let _ = require('lodash');

export default class QualityTable extends Component {

    constructor(props) {
        super(props);
        this.renderCourses = this.renderCourses.bind(this);
        this.renderFailed = this.renderFailed.bind(this);
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

    renderFailed(failedName, i) {
        let returnVal = failedName;
        console.log(failedName);
        if (failedName) {
            if (failedName.indexOf("_") > -1) {
                returnVal = failedName + " - Out of Scheduled Time"
            }
            else {
                returnVal = failedName + " - Not enough seats in classes"
            }
            return <li key={i}>{returnVal}</li>
        }
        return null;
    }

    render() {
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    <h3>
                        Quality: {this.props.failed.length} / {this.props.courses.length} 
                    </h3>
                    <ul>
                        {this.props.failed &&
                            this.props.failed.map(this.renderFailed)}
                    </ul>
                </Col>
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
            </Grid>
        );
    }
}

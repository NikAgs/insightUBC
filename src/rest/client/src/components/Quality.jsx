import React, { Component } from 'react';
import { Grid, Col, ListGroup, Table, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import Moment from 'react-moment';
let _ = require('lodash');

export default class QualityTable extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.renderCourses = this.renderCourses.bind(this);
        this.renderFailed = this.renderFailed.bind(this);
    }

    componentDidMount() {
        const {courses, failed} = this.props;
        let count = 0;
        let fCount = 0;
        if (courses) {
            _.forEach(courses, (course) => {
                count += course.sections;
            });
            if (failed) {
                _.forEach(failed, (fCourse) => {
                    if (fCourse.indexOf("_") > -1) {
                        fCount++
                    } else {
                        let index = _.findIndex(courses, (o) => {
                            return o.courseId == fCourse;
                        })
                        if (index > -1) {
                            fCount += courses[index].sections;
                        }
                    }
                })
            }
        }

        this.setState({
            totalCourses: count,
            failedCourses: fCount
        })
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
        let {failedCourses, totalCourses} = this.state;
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    <h3>
                        Quality: {failedCourses} / {totalCourses}
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

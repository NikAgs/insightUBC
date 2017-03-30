import React, { Component } from 'react';
import { Grid, Row, Col, ListGroup, Table, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import Moment from 'react-moment';
let _ = require('lodash');
let moment = require('moment');
import QualityTable from './Quality';
import ModalOpen from './Modal';

export default class TimeTable extends Component {

    constructor(props) {
        super(props);
        this.getRooms = this.getRooms.bind(this);
        this.state = { countOutside: 0 };
        this.renderSchedule = this.renderSchedule.bind(this);
    }

    componentDidMount() {
        let outSide = [];
        let inSide = [];
        if (this.props.courses) {
            const courses = this.props.courses;
            const scheduledCourses = Object.keys(this.props.scheduledTasks);
            let minutesOfDay = function (m) {
                return m.minutes() + m.hours() * 60;
            }
            _.forEach(scheduledCourses, (cName) => {
                courses.forEach((course) => {
                    if (_.includes(cName, course["courseId"])) {
                        inSide.push(course["courseId"]);
                    }
                });
                let sObj = this.props.scheduledTasks[cName];
                // console.log(sObj);
                let currentTime = moment.unix(sObj.earlyFinish / 1000);
                let startTime = moment("8:00am", "HH:mm a");
                let endTime = moment("5:00pm", "HH:mm a");
                // console.log()
                if (minutesOfDay(currentTime) > minutesOfDay(endTime)) {
                    outSide.push(cName);
                }
            });
            let courseNumber = _.map(courses, "courseId");
            _.pullAll(courseNumber, inSide);
            outSide = _.concat(outSide, this.props.failed, courseNumber);
            _.pull(outSide, undefined);
            this.setState({
                notScheduled: outSide,
                totalCourses: courses.length
            })
            // console.log("If", outSide);
        }
        return;
    }

    renderSchedule(sObj, cName, rName, duration) {
        // console.log(sObj);
        let courseInfo;
        const courses = this.props.courses;
        courses.forEach((course) => {
            if (_.includes(cName, course["courseId"])) {
                courseInfo = course;
            }
        });
        if (sObj.schedule.length > 0 && sObj.schedule[0].resources.length > 0 &&
            sObj.schedule[0].resources[0] == rName && sObj.duration == duration) {
            return (
                <tr key={cName}>
                    <td> <Moment unix format="HH:mm">{sObj.earlyStart / 1000}</Moment> </td>
                    <td> <Moment unix format="HH:mm">{sObj.earlyFinish / 1000}</Moment> </td>
                    <td> {cName} </td>
                    <td> {courseInfo && courseInfo.size} </td>
                </tr>
            );
        }
    }


    getRooms(room, i) {
        return (
            <Row key={i}>
                <div>
                    <h1>{room.rooms_name} - {room.rooms_seats}</h1>
                    <Col sm={12} md={6}>
                        <h3>Monday / Wednesday / Friday</h3>
                        <Table responsive>
                            <thead>
                                <tr><th>Start Time</th><th>End Time</th><th>Course Id</th><th>Students in Course</th></tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.props.scheduledTasks).map((schedule) => {
                                    return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 60);
                                })}
                            </tbody>
                        </Table>
                    </Col>
                    <Col sm={12} md={6}>

                        <h3>Tuesday / Thursday</h3>
                        <Table responsive>
                            <thead>
                                <tr><th>Start Time</th><th>End Time</th><th>Course Id</th><th>Students in Course</th></tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.props.scheduledTasks).map((schedule) => {
                                    return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 90);
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </div>
            </Row>
        )
    }

    render() {
        const modalBody = (<QualityTable courses={this.props.courses} failed={this.state.notScheduled} />)
        const qualityButton = <Button>Show Quality Score</Button>
        return (
            <Grid>
                <Col xs={12}>
                    {
                        this.props.rooms && <ModalOpen modalBody={modalBody} eventListener={qualityButton} />
                    }
                </Col>
                <Col xs={12}>
                    {this.props.rooms &&
                        this.props.rooms.map(this.getRooms)}
                </Col>
            </Grid>
        );
    }
}

import React, { Component } from 'react';
import { Grid, Col, ListGroup, Table, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
// import OutputTable from './OutputTable';
import Moment from 'react-moment';

export default class TimeTable extends Component {

    constructor(props) {
        super(props);
        this.getRooms = this.getRooms.bind(this);
        this.renderSchedule = this.renderSchedule.bind(this);
    }


    renderSchedule(sObj, cName, rName, duration){
        // console.log(sObj);
        let courseInfo;
        (this.props.courses).forEach((course)=>{
            if(course["courseId"].includes(cName)){
                console.log(course);
                courseInfo = course;
            }
        })

        if(sObj.schedule.length > 0 && sObj.schedule[0].resources.length > 0 &&
            sObj.schedule[0].resources[0] == rName && sObj.duration == duration){
            return (
                <tr key={cName}>
                    <td><Moment unix format="HH:mm">{sObj.earlyStart / 1000}</Moment> </td>
                    <td> <Moment unix format="HH:mm">{sObj.earlyFinish / 1000}</Moment> </td>
                    <td> {cName} </td>
                    <td> </td>
                </tr>
            );
        }
    }


    getRooms(room){
        return(
            <div key={room.rooms_name}>
                <h1>{room.rooms_name} - {room.rooms_seats}</h1>
                    <h3>Monday / Wednesday / Friday</h3>
                        <Table responsive>
                        <thead>
                            <tr><th>Start Time</th><th>End Time</th><th>Course Id</th><th>Students in Course</th></tr>
                        </thead>
                        <tbody>
                            {Object.keys(this.props.scheduledTasks).map((schedule)=>{
                                return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 60);
                            })}
                        </tbody>
                        </Table>
                    <h3>Tuesday / Thursday</h3>
                        <Table responsive>
                        <thead>
                        <tr><th>Start Time</th><th>End Time</th><th>Course Id</th><th>Students in Course</th></tr>
                        </thead>
                        <tbody>
                            {Object.keys(this.props.scheduledTasks).map((schedule)=>{
                                return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 90);
                            })}
                        </tbody>
                        </Table>
            </div>
        )
    }

    render() {
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    <div className="table-responsive">
                        {this.props.rooms && 
                            this.props.rooms.map(this.getRooms)}
                    </div>
                </Col>
            </Grid>
        );
    }
}

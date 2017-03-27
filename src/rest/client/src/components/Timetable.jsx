import React, { Component } from 'react';
import { Grid, Col, ListGroup, Button, ListGroupItem, FormGroup, Checkbox } from 'react-bootstrap';
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
        if(sObj.schedule.length > 0 && sObj.schedule[0].resources.length > 0 &&
            sObj.schedule[0].resources[0] == rName && sObj.duration == duration){
            return (
                <div key={cName}>
                    <Moment unix format="HH:mm">{sObj.earlyStart / 1000}</Moment> to <Moment unix format="HH:mm">{sObj.earlyFinish / 1000}</Moment>  {cName}
                </div>
            );
        }
    }


    getRooms(room){
        return(
            <div key={room.rooms_name}>
                <h1>{room.rooms_name} - {room.rooms_seats}</h1>
                    <h3>Monday / Wednesday / Friday</h3>
                        {Object.keys(this.props.scheduledTasks).map((schedule)=>{
                            return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 60);
                        })}
                    <h3>Tuesday / Thursday</h3>
                        {Object.keys(this.props.scheduledTasks).map((schedule)=>{
                            return this.renderSchedule(this.props.scheduledTasks[schedule], schedule, room.rooms_name, 90);
                        })}
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

import React, { Component } from 'react';
import { Button, Col, Grid, ListGroup, ListGroupItem } from 'react-bootstrap';
import Form from './Form'
var fs = require('fs');
var rp = require('request-promise-native');

export default class Uploader extends Component {

    constructor(props) {
        super(props);
        this.uploadZip = this.uploadZip.bind(this);
    }

    uploadZip(event) {
        event.preventDefault();
        console.log(this.inputFile.value, this.type.value);
        var reader = new FileReader();
        console.log(this.inputFile.files[0]);
        let data = reader.readAsArrayBuffer(this.inputFile.files[0]);
        fetch("http://localhost:4321/dataset/rooms", {
            method: 'PUT',
            body: data
        })
            .then((res) => { return res.json(); })
            .then((data) => {
                console.log(data);
            })

        // rp.put("http://localhost:4321/dataset/" + this.type.value)
        //     .attach("body", data, this.type.value + ".zip")
        //     .then((res) => { return res.json(); })
        //     .then((data) => {
        //         console.log(data);
        //     })
    }


    render() {
        return (
            <Grid fluid={true}>
                <Col xs={12}>
                    <form className="form-horizontal" onSubmit={this.uploadZip}>
                        <fieldset>
                            <ListGroup>
                                <ListGroupItem>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label className="control-label text-semibold col-sm-4 col-md-3">Zip File</label>
                                            <div className="col-sm-8 col-md-9">
                                                <input type='file' name='name' ref={ref => this.inputFile = ref} placeholder='Input File' className="form-control" />
                                            </div>
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label className="control-label text-semibold col-sm-4 col-md-3">Room or Courses</label>
                                            <div className="col-sm-8 col-md-9">
                                                <input type='text' name='name' ref={ref => this.type = ref} placeholder='Room or Courses' className="form-control" />
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
                </Col>
            </Grid>
        );
    }
}

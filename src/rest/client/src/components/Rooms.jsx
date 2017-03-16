import React, { Component } from 'react';
import { Button, Col, Grid } from 'react-bootstrap';

export default class Rooms extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            rows: [{
                "key": 1,
                "NAME": "Jack Sparrow",
                "PHONENUMBER": "113-555-8789"
                },
                {
                    "key": 2,
                    "NAME": "Daisy Duck",
                    "PHONENUMBER": "457-898-4545"
                },
                {
                    "key": 3,
                    "NAME": "Huey Duck",
                    "PHONENUMBER": "457-898-4546"
                }],
            columnNames: [{
                title: 'Name', dataIndex: 'NAME', key: 'name'
                }, {
                    title: 'Phone', dataIndex: 'PHONENUMBER', key: 'age'
                }, {
                    title: 'Apeartions', dataIndex: '', key: 'opeartions', render: () => <a href="#">Delete</a>,
                }]
        };
    }

    render() {
        return (
            <Grid fluid={true}>
                <Col xs={10}>
                    <textarea ref={ref => this.queryBox = ref} className="App-intro">

                    </textarea>
                </Col>
                <Col xs={2}>
                    <Button onClick={() => { this.doQuery() }} bsStyle="success">
                        GO
            </Button>
                </Col>
                <Col xs={12}>
                </Col>
            </Grid>
        );
    }
}
import React, { Component } from 'react';
import './App.css';
import { Col, Grid, Row } from 'react-bootstrap';
export default class AppContainer extends Component {

  render() {
    const {children} = this.props;
    return (
      <Grid fluid={true}>
        <Row>
          <div className="App">
            <Col xs={12}>
              {children}
              <div className="text-center">
                <h1>Welcome!</h1>
                <h2>
                  Team 114
                  </h2>
                <h3>
                  Aman Gupta
                <br />
                  Nikhil Agarwal
                </h3>
              </div>
            </Col>
          </div>
        </Row>
      </Grid>
    );
  }
}

AppContainer.propTypes = {
  children: React.PropTypes.node,
}

AppContainer.contextTypes = {
  router: React.PropTypes.object.isRequired
};
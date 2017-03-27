import React, { Component } from 'react';
import MyGreatPlace from './MyGreatPlace.jsx'
import GoogleMap from 'google-map-react';

class Maps extends Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            center: { lat: 49.265831, lng: -123.2527027 },
            zoom: 15,
            hoverKey: null
        }
        this.renderMarkers = this.renderMarkers.bind(this);
        this.onChildClick = this.onChildClick.bind(this);
        this.onChildMouseEnter = this.onChildMouseEnter.bind(this);
        this.onChildMouseLeave = this.onChildMouseLeave.bind(this);
    }

    renderMarkers(visitObj, id) {
        // return (
        //     <MyGreatPlace
        //         key={id} lat={lat} lng={lng} text={textToDisplay}
        //         hover={this.state.hoverKey == id} />
        // )
        return null;

    }
    onChildMouseEnter(key /*, childProps */) {
        this.setState({
            hoverKey: key
        });
    }

    onChildMouseLeave() {
        this.setState({
            hoverKey: null
        });
    }

    onChildClick(key, childProps) {
        console.log(childProps);
        this.setState({
            center: [childProps.lat, childProps.lng]
        });
    }

    render() {
        return (
            <div id="googleMap" style={{ height: 500 + 'px' }}>
                <GoogleMap
                    center={this.state.center}
                    defaultZoom={this.state.zoom}
                    onChildClick={this.onChildClick}
                    onChildMouseEnter={this.onChildMouseEnter}
                    onChildMouseLeave={this.onChildMouseLeave}
                >
                </GoogleMap>
            </div>
        )
    }
}

export default Maps;
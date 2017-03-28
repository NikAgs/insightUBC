import React from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

const K_WIDTH = 50;
const K_HEIGHT = 40;
const K_SIZE = 50;

const greatPlaceStyle = {
    // initially any map object has left top corner at lat lng coordinates
    // it's on you to set object origin to 0,0 coordinates
    position: 'absolute',
    width: K_SIZE,
    height: K_SIZE/2,
    left: -K_SIZE / 2,
    top: -K_SIZE / 2,
    // border: '5px solid #f44336',
    // borderRadius: K_SIZE,
    backgroundColor: 'white',
    textAlign: 'center',
    color: '#3f51b5',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 4,
    cursor: 'pointer'
};

const greatPlaceStyleHover = {
    position: 'absolute',
    width: K_SIZE,
    height: K_SIZE,
    left: -K_SIZE / 2,
    top: -K_SIZE / 2,
    // borderRadius: K_SIZE,
    backgroundColor: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 4,
    cursor: 'pointer',
    // border: '5px solid #3f51b5',
    color: '#f44336'
};

const popOver = {
    backgroundColor: 'white',
    fontSize:10
}

export default class MyGreatPlace extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const style = this.props.hover ? greatPlaceStyleHover : greatPlaceStyle;
        return (
            <div className="hint hint--html hint--info hint--top" style={style}>
                <div>{this.props.text}</div>
                {this.props.hover &&
                    <div style={popOver}>{this.props.obj.rooms_fullname}</div>
                }
            </div>
        );
    }
}

export { greatPlaceStyle, greatPlaceStyleHover, K_SIZE };


MyGreatPlace.propTypes = {
    text: React.PropTypes.string,
    hover: React.PropTypes.bool,
    obj: React.PropTypes.object
};
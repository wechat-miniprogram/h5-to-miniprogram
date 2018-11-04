import React, { Component } from 'react';

export default class Btn extends Component {
    render() {
        return (
            <button onClick={this.props.add}>{this.props.text}</button>
        );
    }
}

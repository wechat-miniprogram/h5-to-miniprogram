import React, { Component } from 'react';

export default class BBB extends Component {
    render() {
        return (
            <div>
                <p>I am bbb</p>
                <p>route: {this.props.match.path}</p>
            </div>
        );
    }
}
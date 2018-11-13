import React, { Component } from 'react';

export default class AAA extends Component {
    render() {
        return (
            <div>
                <p>I am aaa</p>
                <p>route: {this.props.match.path}</p>
            </div>
        );
    }
}
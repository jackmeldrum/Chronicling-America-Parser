import PropTypes from 'prop-types';
import Select from 'react-select';
import React, { Component } from 'react'


const states = ['Alabama', 'Arkansas'];
var stateList = [];
states.forEach(function(element) {
    stateList.push({value: element, label: element})
});
class StateSelectField extends Component{
    constructor(props) {
        super(props);
        this.state = {
            value: [],
        }
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    getInitialState () {
        return {
            value: [],
        };
    }
    handleSelectChange(value) {
        console.log('You\'ve selected:', value);
        this.setState({value});
        console.log(this.state.value);
    }
    render() {
        var {value} = this.state;
        return (
            <Select
                    closeMenuOnSelect={false}
                    isSearchable
					isMulti
					onChange={this.handleSelectChange}
					options={stateList}
					placeholder="Select your state(s)"
                    value={value}
			/>
        );
    }
}

export default StateSelectField;
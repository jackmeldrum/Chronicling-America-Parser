import PropTypes from 'prop-types';
import Select from 'react-select';
import React, { Component } from 'react'


const papers = ['The Abbeville Banner', 'The Abbeville Bulletin'];
var paperList = [];
papers.forEach(function(element) {
    paperList.push({value: element, label: element})
});
class PaperSelectField extends Component{
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
					options={paperList}
					placeholder="Select your newspapers(s)"
                    value={value}
			/>
        );
    }
}

export default PaperSelectField;
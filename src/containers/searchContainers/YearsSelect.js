import PropTypes from 'prop-types';
import Select from 'react-select';
import React, { Component } from 'react'

class YearSelectField extends Component{
    constructor(props) {
        super(props);
        this.state = {
            value: props.year.toString(),
            start: props.start,
            end: props.end
        }
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    
    handleSelectChange(value) {
        this.setState({value});
    }
    render() {
        var years = [];
        for (var i = this.state.start; i <= this.state.end; i++) {
            years.push(i);
        }
        var yearList = [];
        years.forEach(function(element) {
            yearList.push({value: element, label: element})
        });
        var {value} = this.state;
        return (
            <Select
                    closeMenuOnSelect={true}
                    placeholder={this.state.value}
                    onChange={this.handleSelectChange}
					options={yearList}
                    value={value}
			/>
        );
    }
}

YearSelectField.propTypes = {
    year: PropTypes.number,
    start: PropTypes.number,
    end: PropTypes.number
};

export default YearSelectField;
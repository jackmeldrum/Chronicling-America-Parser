import React, { Component } from 'react'
import MySelect from './MySelect'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import $ from 'jquery'


class Search extends Component {
    constructor() {
        super()
        this.state = {
            advanced: false,
            city: '',
            states: [],
            newspapers: [],
            publisher: '',
            from: {},
            to: {},
            search_terms: '',
            include_any: '',
            include_all: '',
            include_phrase: '',
            include_none: '',
            include_these: '',
            within: '',
            supportDate: true,
            error: '',
            articles: [],
            activePage: 1,
            per_page: 10,
            totalItemsCount: 0,
            start: 1,
            heatmapModalIsOpen: false,
            search: false,
            csv: [],
            innerMessage: '',
            sortBy: 'publication_date',
            sortOrder: 'asc',
            missingField: false,
            csvLimit: 25000,
            heatmapLimit: 500000,
            validSize: true,
            finalPage: 0,
            tab_index: 0,
        }
        
        // this.openHModal = this.openHModal.bind(this)
        // this.closeHModal = this.closeHModal.bind(this)
        // this.onChange = this.onChange.bind(this)
        this.onSubmitSimple = this.onSubmitSimple.bind(this)
        this.onSubmitAdvanced = this.onSubmitAdvanced.bind(this)
        // this.onPageChange = this.onPageChange.bind(this)
        // this.onAdvance = this.onAdvance.bind(this)
        // this.onSimple = this.onSimple.bind(this)
        // this.handleFrom = this.handleFrom.bind(this)
        // this.handleTo = this.handleTo.bind(this)
        // this.handlePageChange = this.handlePageChange.bind(this)
        // this.onHeatmap = this.onHeatmap.bind(this)
        // this.downloadHeatmap = this.downloadHeatmap.bind(this)
        // this.onCSV = this.onCSV.bind(this)
        // this.onSave = this.onSave.bind(this)
        // this.handleSortOrder = this.handleSortOrder.bind(this)
       this.print = this.print.bind(this)
    }

    handleChange = (selected, target) => {
        this.setState({
            [target]: selected
        });
        console.log(this.state);
    };
    onSubmitSimple = (e) => {
        if(e)
            e.preventDefault()
        
        
    }
    onSubmitAdvanced = (e) => {
        console.log(e);
        this.setState({activePage: 1})
        if(e)
            e.preventDefault()
        
        var advanceData = {}
        $("#advanced").serializeArray().forEach(function(x){advanceData[x.name] = x.value})
        advanceData['states'] = [];
        advanceData['newspapers'] = [];
        if (this.state.states.length === 0) {
            this.state.stateList.forEach(function(x){advanceData['states'].push(x.value)})
        } else {
            this.state.states.forEach(function(x){advanceData['states'].push(x.value)})
        }
        
        if (this.state.newspapers.length === 0) {
            this.state.paperList.forEach(function(x){advanceData['newspapers'].push(x.value)})
        } else {
            this.state.newspapers.forEach(function(x){advanceData['newspapers'].push(x.value)})

        }
        console.log(advanceData);
        console.log(this.state.states);

        advanceData.sortBy = this.state.sortBy
        advanceData.sortOrder = this.state.sortOrder
        advanceData.page = 0
        advanceData.per_page = this.state.per_page

        if (advanceData.from === "") {
            advanceData.from = this.state.startYear
        }
        if (advanceData.to === "") {
            advanceData.to = this.state.endYear
        }

        $('#loadingCircle').css("display", "block")

    }

    print() {
        console.log(this.state);
    }
    render() {
        const states = ['Alabama', 'Arkansas', 'Florida'];
        var stateList = [];
        states.forEach(function(element) {
            stateList.push({label: element, value: element})
        });
        this.state.stateList = stateList;
        const papers = ['The Abbeville Banner', 'The Abbeville Bulletin'];
        var paperList = [];
        papers.forEach(function(element) {
            paperList.push({value: element, label: element})
        });
        this.state.paperList = paperList;
        this.state.startYear = 1789;
        this.state.endYear = 1963;
        
        var years = [];
        for (var i = this.state.startYear; i <= this.state.endYear; i++) {
            years.push(i);
        }
        var yearList = [];
        years.forEach(function(element) {
            yearList.push({value: element, label: element})
        });
        // Styles
        const inputDivStyle = { 
            padding: '20px',
            width: '100%',
        };
        const labelStyle = {
            maxWidth: '15%',
        }
        const inputStyle = {
            width: '25%'
        }
        const betweenList = [
            {label: 5, value: 5},
            {label: 10, value: 10},
            {label: 15, value: 15},

        ];
        const selected = this.state.states;
        const simpleSearch = (
            <form noValidate onSubmit={this.onSubmitSimple} id="simple">
                <div className="row" style={inputDivStyle}>
                    <label className="col-lg-3 col-xs-4" style={labelStyle} id="search_terms">
                                Search terms:
                    </label>
                    <input type="text" value={this.state.search_terms} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'search_terms')} />
                </div>
                <div className="p-1">
                        <button type="submit" className="btn btn-success" id="simpleSearchBtton">Search</button>
                </div>
                <div className="loader" id="loadingCircle"></div> 
                <button type="button" onClick={this.print}>Print</button>
            </form>
        );
        const advancedSearch = (
            <form noValidate onSubmit={this.onSubmitAdvanced} id="advanced">
                    <div className="row" style={inputDivStyle}>
                        <label htmlFor="state" className="p-2">State:</label>
                        <div className="col-lg-3 col-xs-4" id="stateInput">
                            <MySelect
                                id="states" 
                                name="states"
                                options={stateList}
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false} 
                                onChange={(e) => this.handleChange(e, 'states')}
                                allowSelectAll={true}
                                value={this.state.states}/>
                        </div>
                        <label htmlFor="newspaper" className="p-2">Newspaper:</label>
                        <div className="col-lg-3 col-xs-4" id="newspaperInput">
                            <MySelect
                                    id="newspapers" 
                                    name="newspapers"
                                    options={paperList}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false} 
                                    onChange={(e) => this.handleChange(e, 'newspapers')}
                                    allowSelectAll={true}
                                    value={this.state.newspapers}/>
                        </div>
                        <label htmlFor="year" className="p-2">Years:</label>
                        <div className="col-lg-2 col-xs-4" id="startYearInput">
                            <MySelect
                                    id="from" 
                                    name="from"
                                    options={yearList}
                                    closeMenuOnSelect={true}
                                    hideSelectedOptions={false} 
                                    onChange={(e) => this.handleChange(e, 'from')}
                                    allowSelectAll={false}
                                    placeholder={this.state.startYear}
                                    isOptionDisabled={option => option.value > this.state.to.value}
                                    value={this.state.from}/>
                            <div> to </div>
                            <MySelect
                                    id="to" 
                                    name="to"
                                    options={yearList}
                                    closeMenuOnSelect={true}
                                    hideSelectedOptions={false} 
                                    onChange={(e) => this.handleChange(e, 'to')}
                                    allowSelectAll={false}
                                    placeholder={this.state.endYear}
                                    isOptionDisabled={option => option.value < this.state.from.value}
                                    value={this.state.to}/>
                        </div>
                    </div>
                    <div className="row" style={inputDivStyle}>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="anyWords">
                            With any of the words:
                        </label>
                        <input id="include_any" name="include_any" type="text" value={this.state.include_any} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'include_any')} />
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="noneWords">
                            With none of the words:
                        </label>
                        <input id="include_none" name="include_none" type="text" value={this.state.include_none} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'include_none')}/>
                    </div>
                    <div className="row" style={inputDivStyle}>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="allWords">
                            With all of the words:
                        </label>
                        <input id="include_all" name="include_all" type="text" value={this.state.include_all} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'include_all')}/>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="exactWords">
                            With the exact phrase:
                        </label>
                        <input id="include_phrase" name="include_phrase" type="text" value={this.state.include_phrase} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'include_phrase')}/>
                    </div>
                    <div className="row" style={inputDivStyle}>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="betweenWords">
                            With the words:
                        </label>
                        <input id="include_these" name="include_these" type="text" value={this.state.include_these} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'include_these')}/>

                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="betweenWords">
                            within
                        </label>
                        <MySelect
                                id="within" 
                                name="within"
                                options={betweenList}
                                closeMenuOnSelect={true}
                                hideSelectedOptions={false} 
                                onChange={(e) => this.handleChange(e, 'within')}
                                allowSelectAll={false}
                                placeholder="5"
                                value={this.state.within}/>
                        <label className="col-lg-3 col-xs-4" style={labelStyle}>
                            of each other
                        </label>
                    </div>
                    <div className="p-1">
                        <button type="submit" className="btn btn-success" id="advancedSearchBtton">Search</button>
                    </div>
                <button type="button" onClick={this.print}>Print</button>
            </form>  
            

        );
        
        const tab = (
            <Tabs selectedIndex={this.state.tab_index} onSelect={tab_index => this.setState({tab_index})}>
                <TabList>
                    <Tab>Simple Search</Tab>
                    <Tab>Advanced Search</Tab>
                </TabList>
                <TabPanel>
                    {simpleSearch}
                </TabPanel>
                <TabPanel>
                    {advancedSearch}
                </TabPanel>
            </Tabs>
        );
        return (
            <div>
                {tab}
            </div>
        );
    }
}
export default Search
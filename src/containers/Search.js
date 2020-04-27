import React, { Component } from 'react'
import MySelect from './MySelect'
import {Article} from './Article'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import $ from 'jquery'
import L from 'leaflet'
import LHeatMap from 'leaflet-heatmap'
import {getNewspapers, queryAllData, saveNewQuery} from './UserFunctions'


class Search extends Component {
    constructor() {
        super()
        this.state = {
            advanced: false,
            city: '',
            states: [],
            stateList: [],
            newspapers: [],
            paperList: [],
            publisher: '',
            from: '',
            to: '',
            yearList: [],
            startYear: '',
            endYear: '',
            search_terms: '',
            any: '',
            all: '',
            exact: '',
            none: '',
            within: '',
            withinNum: '',
            save_name: '',
            supportDate: true,
            error: '',
            articles: [],
            orig_articles: [],
            activePage: 1,
            per_page: 10,
            totalItemsCount: 0,
            start: 1,
            heatmapModalIsOpen: false,
            heatmapCreated: false,
            heatMap: '',
            search: false,
            csv: [],
            innerMessage: '',
            sortBy: 'relev',
            sortOrder: 'relev',
            missingField: false,
            csvLimit: 25000,
            heatmapLimit: 500000,
            validSize: true,
            finalPage: 0,
            tab_index: 0,
        }
        
        this.openHModal = this.openHModal.bind(this)
        this.closeHModal = this.closeHModal.bind(this)
        // this.onChange = this.onChange.bind(this)
        this.onSubmitSimple = this.onSubmitSimple.bind(this);
        this.onSubmitAdvanced = this.onSubmitAdvanced.bind(this);
        // this.onPageChange = this.onPageChange.bind(this)
        // this.onAdvance = this.onAdvance.bind(this)
        // this.onSimple = this.onSimple.bind(this)
        // this.handleFrom = this.handleFrom.bind(this)
        // this.handleTo = this.handleTo.bind(this)
        // this.handlePageChange = this.handlePageChange.bind(this)
        this.onHeatmap = this.onHeatmap.bind(this)
        // this.downloadHeatmap = this.downloadHeatmap.bind(this)
        this.onCSV = this.onCSV.bind(this);
        this.onSave = this.onSave.bind(this);
        this.handleSortOrder = this.handleSortOrder.bind(this)
    }
    componentDidMount () {
        this.setDefaults();
        var userQuery = JSON.parse(localStorage.getItem("viewSavedQuery"))
        var papers = [];
        var paperList = [];
        getNewspapers().then(res => {
            if (res.newspapers) {
                papers = res.newspapers;
                papers.forEach(function(element) {
                    paperList.push({value: element, label: element})
                });
                this.setState({paperList},  () => {
                    if(userQuery){
                        localStorage.removeItem("viewSavedQuery")
                         
                         for (var key in userQuery) {
                             if (userQuery[key] !== null) {
                                 this.setState({
                                     [key]: userQuery[key]
                                 })
                             }
                         }

                         var states= userQuery.states;
                         var stateList = [];
                         states.forEach(function(element) {
                            stateList.push({label: element, value: element})
                         });

                         this.setState({states: stateList});

                         var newspapers = userQuery.newspapers;
                         var newspapersList = [];
                         newspapers.forEach(function(element) {
                             newspapersList.push({label: element, value: element})
                         });
                         

                         this.setState({newspapers: newspapersList});

                         this.setState({from: userQuery['startYear'].toString()});
                         this.setState({to: userQuery['endYear'].toString()});
                         // API uses not as the term but website uses none.
                         this.setState({none: userQuery['not']});
                         this.setState({'tab_index': 1}, () => {
                         
                            // if(Object.keys(userQuery).length > 3)
                            //     this.setState({advanced: true})
                            this.onSubmitAdvanced();
                         })   
                     } 
                });
            } 
        });

        
    }
    
    setDefaults = () => {
        const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',  'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
        'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
        'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        var stateList = [];
        states.forEach(function(element) {
            stateList.push({label: element, value: element})
        });
        this.setState({stateList});
        
        
        this.setState({startYear: 1789},() => {
            this.setState({endYear: 1963}, () =>{
                var years = [];
                for (var i = this.state.startYear; i <= this.state.endYear; i++) {
                    years.push(i);
                }
                var yearList = [];
                years.forEach(function(element) {
                    yearList.push({label: element, value: element})
                });
                this.setState({yearList});
            });
        });
        
        //this.setState({'yearList': yearList})
    }

    handleChange = (selected, target) => {
        this.setState({
            [target]: selected
        });
    }

    openHModal(){
        this.setState({heatmapModalIsOpen:true})
    }

    closeHModal(){
        this.setState({heatmapModalIsOpen:false})
        $('#map').css({"display":"none"})
    }

    handleSortOrder(e){
        this.setState({'sortBy': $("#sortBy")[0].value}, () => {
            var articles = this.state.articles;
            if (this.state.sortBy === 'asc') {
                // sort orig by date
                this.setState({'articles':articles.sort(function (a, b) {
                    return new Date(a.publish_date) - new Date(b.publish_date)})
                });
                
            }
            else if (this.state.sortBy === 'desc') {
                // sort orig by date, reversed
                this.setState({'articles':articles.sort(function (a, b) {
                    return new Date(b.publish_date) - new Date(a.publish_date)})
                });
            }
            else {
                // relev is the default that solr returns to us
                // Stringify and parse to deep copy the articles rather than point to the same object
                this.setState({'articles': JSON.parse(JSON.stringify(this.state.orig_articles))});
            }

        })   
        
    }


    onCSV = () => {
        this.setState({csv: this.state.articles},function(){
            const data = this.state.csv.map(row=>({
                newspaper: row.newspaper,
                publisher: row.publisher,
                city: row.city, 
                state: row.state,
                title: row.title,
                publish_date: row.publish_date,
                article_text: row.article_text,
                article_url: row.article_url
             }))

             
             const csvRows = []
             //get headers
             const headers = Object.keys(data[0])
             csvRows.push(headers.join(','))

             //loop over the row
             for(const row of data){
                const values = headers.map(header=>{
                    const escaped = (''+row[header]).replace(/(\r\n|\n|\r])/gm, " ")
                    const escaped2 = (escaped).replace(/"/g, "''")
                    return '"'+escaped2+'"'
                })
                csvRows.push(values.join(','))
                
             }
          
           const csvData = csvRows.join('\n')
            
           

           const blob = new Blob([csvData], {type: 'text/csv'})
           
           if(this.state.supportDate === false){
           navigator.msSaveOrOpenBlob(blob, 'download.csv')
           }else{
           const url = window.URL.createObjectURL(blob)
           const a = document.createElement('a')
           a.setAttribute('hidden', '')
           a.setAttribute('href', url)
           a.setAttribute('download', 'download.csv')
           document.body.appendChild(a)
           a.click()
           document.body.removeChild(a)
           }
          })
    }

    onHeatmap = () => {
        this.setState({'heatmapModalIsOpen':true})
        $('#map').css({"display":"block"})

        // $('#map').css({"display":"block"})
        // window.setCoordinates(this.state.articles)

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 20,
            // scales the radius based on map zoom
            "scaleRadius": false,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": false,
            gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'},
            maxOpacity: 0.8,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            blur: .95,
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'value'
          };

        var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            });
            if (!this.state.heatmapCreated) {
                this.setState({heatmapCreated: true});
                this.setState({heatMap: new LHeatMap(cfg)}, () =>{
                    var map = L.map('map', {
                        center: new L.LatLng(39.0, -98.5),
                        zoom: 4,
                        layers: [tiles, this.state.heatMap]
                    });

                    var latLongs = [];
                    this.state.articles.forEach(function(article){
                        if (article.latitude && article.latitude.length > 0 && article.longitude && article.longitude.length > 0) {
                            latLongs.push({
                                lat: article.latitude[0],
                                lng: article.longitude[0],
                                
                            })
                        } 
                    })

                    var data = {
                        max: 250,
                        min: 0,
                        data: latLongs
                    }
                    this.state.heatMap.setData(data);
                });    
            } 
            else {
                var latLongs = [];
                this.state.articles.forEach(function(article){
                    if (article.latitude && article.latitude.length > 0 && article.longitude && article.longitude.length > 0) {
                        latLongs.push({
                            lat: article.latitude[0],
                            lng: article.longitude[0],
                            value: 1
                        })
                    } 
                })

                var data = {
                    max: 100,
                    min: 0,
                    data: latLongs
                }
                this.state.heatMap.setData(data);
            }
	// Create and call the mapper, passing the dataset and the options
    // var heat = heatMap.heatLayer(dataset, options).addTo(map);
    // this.setState({heatMap});
    
    }
    onSave = () => {
        if (localStorage.usertoken) {
            if (!this.state.save_name || this.state.save_name === '') {
                this.setState({innerMessage: "Specify a query name"}, function(){
                    $('#innerMessage').css("color", "red")
                    $('#innerMessage').show()
                    $('#innerMessage').fadeOut(2000)
                })
            }
            else {
                if (this.state.tab_index === 1) {
                    var advanceData = {}
                    $("#advanced").serializeArray().forEach(function(x){advanceData[x.name] = x.value})
                    advanceData['states'] = [];
                    advanceData['newspapers'] = [];
                    if (!this.state.states || this.state.states.length === 0) {
                        this.state.stateList.forEach(function(x){advanceData['states'].push(x.value)})
                    } else {
                        this.state.states.forEach(function(x){advanceData['states'].push(x.value)})
                    }
                    
                    if (!this.state.newspapers || this.state.newspapers.length === 0) {
                        this.state.paperList.forEach(function(x){advanceData['newspapers'].push(x.value)})
                    } else {
                        this.state.newspapers.forEach(function(x){advanceData['newspapers'].push(x.value)})
                    }

                    advanceData.save_name = this.state.save_name
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
                    saveNewQuery(advanceData).then(res => {
                        if (res) {
                            if (res.success) {
                                this.setState({innerMessage: "Query Saved"}, function(){
                                    $('#innerMessage').css("color", "green")
                                    $('#innerMessage').show()
                                    $('#innerMessage').fadeOut(2000)
                                })
                            }
                            else{
                                this.setState({innerMessage: "Please login again"}, function(){
                                    $('#innerMessage').css("color", "red")
                                    $('#innerMessage').show()
                                    $('#innerMessage').fadeOut(2000)
                                    localStorage.removeItem('usertoken')
                                })  
                            }
                        } 
                    })
                }
                else {
                    var simpleData = {}
                    $("#simple").serializeArray().forEach(function(x){simpleData[x.name] = x.value})
                    simpleData.page = 0
                    simpleData.per_page = this.state.per_page
                    simpleData.sortBy = this.state.sortBy
                    simpleData.sortOrder = this.state.sortOrder
                    simpleData.any = simpleData.search_terms
                    simpleData['states'] = [];
                    simpleData['newspapers'] = [];
                    this.state.stateList.forEach(function(x){simpleData['states'].push(x.value)})
                    this.state.paperList.forEach(function(x){simpleData['newspapers'].push(x.value)})
                    simpleData.from = this.state.startYear
                    simpleData.to = this.state.endYear
                    simpleData.exact = ''
                    simpleData.none = ''
                    simpleData.all = ''
                    simpleData.within = ''
                    simpleData.withinNum = '5'
                    simpleData.save_name = this.state.save_name

                    saveNewQuery(simpleData).then(res => {
                        if (res) {
                            if (res.success) {
                                this.setState({innerMessage: "Query Saved"}, function(){
                                    $('#innerMessage').css("color", "green")
                                    $('#innerMessage').show()
                                    $('#innerMessage').fadeOut(2000)
                                })
                            }
                            else{
                                this.setState({innerMessage: "Please login again"}, function(){
                                    $('#innerMessage').css("color", "red")
                                    $('#innerMessage').show()
                                    $('#innerMessage').fadeOut(2000)
                                    localStorage.removeItem('usertoken')
                                })  
                            }
                        } 
                    })
                }
            }   
        }
        else {
            this.setState({innerMessage: "Please log in to save a query"}, function(){
                $('#innerMessage').css("color", "blue")
                $('#innerMessage').show()
                $('#innerMessage').fadeOut(2000)
            })
        }
    }
    
    onSubmitSimple = (e) => {
        if(e)
            e.preventDefault()
        
        var simpleData = {}
        this.closeHModal();
        $("#simple").serializeArray().forEach(function(x){simpleData[x.name] = x.value})
        simpleData.page = 0
        simpleData.per_page = this.state.per_page
        simpleData.sortBy = this.state.sortBy
        simpleData.sortOrder = this.state.sortOrder
        simpleData.any = simpleData.search_terms
        simpleData['states'] = [];
        simpleData['newspapers'] = [];
        this.state.stateList.forEach(function(x){simpleData['states'].push(x.value)});
        this.state.paperList.forEach(function(x){simpleData['newspapers'].push(x.value)});
        simpleData.from = this.state.startYear;
        simpleData.to = this.state.endYear;
        simpleData.exact = '';
        simpleData.none = '';
        simpleData.all = '';
        simpleData.within = '';
        simpleData.withinNum = '5';
    
        queryAllData(simpleData).then(res => {
            if (res) {
                this.setState({ articles: [] }, function(){
                    $('#loadingCircle').css("display", "none")
                    this.setState({ 'start': 1 })
                    this.setState({ 'articles': res.articles }, function(){
                        this.setState({'orig_articles': JSON.parse(JSON.stringify(res.articles))});
                        this.setState({'search': true});
                    })
                })
                this.setState({ totalItemsCount: res.articles.length })
            }
        })

    }

    onSubmitAdvanced = (e) => {
        this.setState({activePage: 1});
        if(e) {
            e.preventDefault()
        }
        
        var advanceData = {}
        this.closeHModal();
        $("#advanced").serializeArray().forEach(function(x){advanceData[x.name] = x.value})
        advanceData['states'] = [];
        advanceData['newspapers'] = [];
        if (!this.state.states || this.state.states.length === 0) {
            this.state.stateList.forEach(function(x){advanceData['states'].push(x.value)})
        } else {
            this.state.states.forEach(function(x){advanceData['states'].push(x.value)})
        }
        
        if (!this.state.newspapers || this.state.newspapers.length === 0) {
            this.state.paperList.forEach(function(x){advanceData['newspapers'].push(x.value)})
        } else {
            this.state.newspapers.forEach(function(x){advanceData['newspapers'].push(x.value)})

        }
        advanceData.sortBy = this.state.sortBy;
        advanceData.sortOrder = this.state.sortOrder;
        advanceData.page = 0;
        advanceData.per_page = this.state.per_page;

        if (advanceData.from === "") {
            advanceData.from = this.state.startYear;
        }
        if (advanceData.to === "") {
            advanceData.to = this.state.endYear;
        }
        console.log(advanceData);
        $('#loadingCircle').css("display", "block")
        queryAllData(advanceData).then(res => {
            if (res) {
                this.setState({ articles: [] }, function(){
                    $('#loadingCircle').css("display", "none")
                    this.setState({ 'start': 1 });
                    this.setState({ 'articles': res.articles }, function(){
                        this.setState({'orig_articles': JSON.parse(JSON.stringify(res.articles))});
                        this.setState({'search': true})
                    })
                })
                this.setState({ totalItemsCount: res.articles.length })
            }
            
        })
    }

    render() {
        
        // Styles
        const inputDivStyle = { 
            padding: '20px',
            width: '100%',
        };
        const labelStyle = {
            textAlign: 'right'
        }
        const inputStyle = {
            width: '25%'
        }

        const betweenList = [
            {label: 5, value: 5},
            {label: 10, value: 10},
            {label: 15, value: 15},
        ];
        
        var resultBar = (
            <div className="card pt-2">
                <div className="card-header">
                    <div className="d-flex justify-content-between">
                        <div className="my-auto">
                            <span>
                                <h6 className="m-0"><b>{this.state.start}-{this.state.start+this.state.articles.length-1} of {this.state.totalItemsCount}</b></h6>
                            </span>
                        </div>
                        <div id="messageBox" className="my-auto">
                            <span>
                                <h5><b id="innerMessage" style={{display: 'none'}}>{this.state.innerMessage}</b></h5>
                            </span>
                        </div>
                    <div className="my-auto">
                    <div className="input-group">

            <label htmlFor="sortBy" className="p-2"><b>Sort Order:</b></label>
            <select className="form-control rounded" id="sortBy" value={this.state.sortBy} onChange={this.handleSortOrder}>
                <option value='relev'>Relevance</option>
                <option value='asc'>Publication Date : Ascending</option>
                <option value='desc'>Publication Date : Descending</option>
            </select>
            </div>
            <div align="bottom">
            <label style={{marginRight: "5px"}}>
                    Query name:
                </label>
                <input type="text" align="bottom" value={this.state.save_name} id = "save_name" onChange={(e) => this.handleChange(e.target.value, 'save_name')} />
            </div>
                
                <button type="button" id="saveSearchButton" className="btn btn-success" onClick={this.onSave}>Save Search</button>
                <button type="button" id="heatmapButton"  className="btn btn-warning" onClick={this.onCSV}>Download CSV</button>
                <button type="button" id="heatmapButton"  className="btn btn-danger" onClick={this.state.heatmapModalIsOpen ? this.closeHModal:this.onHeatmap}>{this.state.heatmapModalIsOpen ? 'Close Map' : 'View Heat Map'}</button>
            </div>
            </div>
          </div>
        </div>
        )

        const articles = this.state.articles.map((article) => <Article key={article.id} article={article} />);

        const noResult = (
            <div className="card">
                    <div className="card-header text-center">
                    <b>No Result</b>
                    </div>
            </div>
        )

        const simpleSearch = (
            <form noValidate onSubmit={this.onSubmitSimple} id="simple">
                <div className="row" style={inputDivStyle}>
                    <label className="col-lg-3 col-xs-4" style={labelStyle} id="search_terms">
                                Search terms:
                    </label>
                    <input id="search_terms" name="search_terms" type="text" value={this.state.search_terms} 
                        style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'search_terms')} />
                </div>
                <div className="p-1">
                        <button type="submit" className="btn btn-success" id="simpleSearchBtton">Search</button>
                </div>
                <div className="loader" id="loadingCircle"></div> 
            </form>
        );
        const advancedSearch = (
            <form noValidate onSubmit={this.onSubmitAdvanced} id="advanced">
                    <div className="row" style={inputDivStyle}>
                        <label htmlFor="state" className="p-2" style={{textAlign: "right"}}>State:</label>
                        <div className="col-lg-3 col-xs-4" id="stateInput">
                            <MySelect
                                id="states"
                                name="states"
                                options={this.state.stateList}
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false} 
                                onChange={(e) => this.handleChange(e, 'states')}
                                allowSelectAll={true}
                                value={this.state.states}/>
                        </div>
                        <label htmlFor="newspaper" className="p-2" style={{textAlign: "right"}}>Newspaper:</label>
                        <div className="col-lg-3 col-xs-4" id="newspaperInput">
                            <MySelect
                                    id="newspapers" 
                                    name="newspapers"
                                    options={this.state.paperList || []}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false} 
                                    onChange={(e) => this.handleChange(e, 'newspapers')}
                                    allowSelectAll={true}
                                    value={this.state.newspapers}/>
                        </div>
                        <label htmlFor="year" className="p-2" style={{textAlign: "right"}}>Years:</label>
                        <div className="col-lg-2 col-xs-4" id="startYearInput">
                            <MySelect
                                    id="from" 
                                    name="from"
                                    options={this.state.yearList}
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
                                    options={this.state.yearList}
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
                        <input id="any" name="any" type="text" value={this.state.any} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'any')} />
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="noneWords">
                            With none of the words:
                        </label>
                        <input id="none" name="none" type="text" value={this.state.none} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'none')}/>
                    </div>
                    <div className="row" style={inputDivStyle}>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="allWords">
                            With all of the words:
                        </label>
                        <input id="all" name="all" type="text" value={this.state.all} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'all')}/>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="exactWords">
                            With the exact phrase:
                        </label>
                        <input id="exact" name="exact" type="text" value={this.state.exact} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'exact')}/>
                    </div>
                    <div className="row" style={inputDivStyle}>
                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="betweenWords">
                            With the words:
                        </label>
                        <input id="within" name="within" type="text" value={this.state.within} style={inputStyle} onChange={(e) => this.handleChange(e.target.value, 'within')}/>

                        <label className="col-lg-3 col-xs-4" style={labelStyle} id="betweenWords">
                            within
                        </label>
                        <MySelect
                                id="withinNum" 
                                name="withinNum"
                                className="col-lg-1 col-xs-4"
                                options={betweenList}
                                closeMenuOnSelect={true}
                                hideSelectedOptions={false} 
                                onChange={(e) => this.handleChange(e, 'withinNum')}
                                allowSelectAll={false}
                                placeholder="5"
                                value={this.state.withinNum}/>
                        <label className=" col-xs-4" style={labelStyle}>
                            words of each other
                        </label>
                    </div>
                    <div className="p-1">
                        <button type="submit" className="btn btn-success" id="advancedSearchBtton">Search</button>
                    </div>
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

        const mapper = (
            <div id="mapper">
                
                 
            </div>
        )
        return (
            <div>
                
                <div>
                    {tab}
                    {(this.state.totalItemsCount !== 0) ? resultBar : ''}
                    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css"/>
                    <script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>
                    <div id="map" style={{width: 800, height: 600, display:'none', margin: '0 auto'}}></div>
                    {(this.state.totalItemsCount === 0 && this.state.search) ? noResult : articles}
                </div>
                
            </div>
            
        );
    }
}
export default Search
import React, { Component } from 'react'
import { getProfile } from './UserFunctions'
import { recallUserQueries } from './UserFunctions'
import Pagination from 'react-js-pagination'
import {Querie} from './Querie'


class Profile extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
      email: '',
      total: 0,
      per_page: 10,
      current_page: 0, 
      queries: []
    }
   this.handlePageChange = this.handlePageChange.bind(this)
   this.onRefresh = this.onRefresh.bind(this)
  }

  componentDidMount() {
    
    const tokenValue = localStorage.usertoken
    if (tokenValue) {
        recallUserQueries(tokenValue).then(res => {
            if (res) {
              this.setState({queries: res.queries})
              // this.setState({current_page: res.current_page}, function(){
              //     this.setState({per_page: res.per_page}, function(){
              //     this.setState({total: res.total})
              if (res.queries) {
                this.setState({total: res.queries.length})
              }
            }
            
    })
    }
    else {
      localStorage.removeItem('usertoken')
      this.props.history.replace('/login')
    }
  }
onRefresh(){
const tokenValue = localStorage.usertoken
    const data = {
      tokenValue: tokenValue,
    }
    getProfile(tokenValue).then(res => {
      if (!res.error) {
        
        recallUserQueries(tokenValue).then(res => {
          if(res.to === null){
            this.setState({current_page: this.state.current_page - 1})
          }
          this.setState({queries: res.data}, function(){
            this.setState({current_page: res.current_page}, function(){
              this.setState({per_page: res.per_page}, function(){
                this.setState({total: res.total})
              })
            })
          })
         
        })

        

    } else {
      localStorage.removeItem('usertoken')
      this.props.history.replace('/')
    }
      
      
    })
}
handlePageChange(pageNumber){

  this.setState({current_page: pageNumber}, function(){
    const tokenValue = localStorage.usertoken
    const data = {
      tokenValue: tokenValue,
      page: pageNumber
    }
})
}  


  render() {

    var queries = []
    if (this.state.queries && this.state.queries.length > 0) {
      queries = this.state.queries.map((querie) => <Querie {...this.props} key={querie.queryID} querie={querie} />)
    }

    const noResult = (
      <div className="card">
              <div className="card-header text-center">
              <b>No queries found. Please save queries after performing a search</b>
              </div>
      </div>
  )

    const paginationBar = (
      <div className='d-flex justify-content-center'>
      <Pagination
      activePage={this.state.current_page}
      itemsCountPerPage={this.state.per_page}
      totalItemsCount={this.state.total}
      pageRangeDisplayed={5}
      onChange={this.handlePageChange}
      itemClass='page-item'
      linkClass='page-link'
      />
      </div>
  )

    return (
      <div className="container">
        {/* <div>
          Reset Password
          <div className="row">
            <label>
              Email
            </label>
            <label>
              Old Password
            </label>
          </div>
          <div className="row">
            <label>
              New Password
            </label>
            <label>
              Confirm New Password
              <input type="text"/>
            </label>
          </div> */}
          
        {/* </div> */}
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">Saved Queries</h1>
          </div>
        </div>
        <button id="onRefresh" onClick={this.onRefresh} className="invisible" ><b>View</b></button>
        {(this.state.total !== 0 ) ? queries : noResult}
        {(this.state.total !== 0) ? paginationBar : ''}
      </div>
    )
  }
}

export default Profile
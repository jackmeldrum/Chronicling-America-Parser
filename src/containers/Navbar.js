import React, {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import { checkPermissions } from './UserFunctions'

class Navbar extends Component{
    
    logOut(e){
        e.preventDefault()
        localStorage.removeItem('usertoken')
        this.props.history.replace('/')
    }

    render(){
        const loginRegLink = (
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <Link to="/login" className="nav-link">
                        Login
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/signup" className="nav-link">
                        Register
                    </Link>
                </li>
            </ul>
        )

        const userLink = (
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <Link to="/profile" className="nav-link">
                        Profile
                    </Link>
                </li>
                <li className="nav-item">
                    <a href="/" onClick={this.logOut.bind(this)} className="nav-link">
                        Logout
                    </a>
                </li>
            </ul>
        )

        return(
            <nav className="navbar navbar-expand-md navbar-dark bg-dark">
            
                <button className="navbar-toggler collapsed" data-toggle="collapse" data-target="#navbar1" 
                aria-controls="navbar1" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>

                <div id="navbar1" className="collapse navbar-collapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/search" className="nav-link">
                                Search
                            </Link>
                        </li>
                        <li className="nav-item" style={{display: (localStorage.isAdmin ? 'block':'none')}}>
                            <Link to="/users" className="nav-link">
                                Users
                            </Link>
                        </li>
                    </ul>
                    {(localStorage.usertoken === 'undefined' || !localStorage.usertoken) ? loginRegLink : userLink }
                </div>
            </nav>
        )
    }
}

export default withRouter(Navbar)
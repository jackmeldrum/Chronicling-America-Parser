import React, { Component } from 'react'
import {checkPermissions, changeUserPermissions, getAllUsers,} from './UserFunctions'

class Users extends Component {
    constructor() {
        super()
        this.state = {
            isAdmin: false,
            users: [],
            tableData: ''
        }
    }

    componentDidMount () {
        const data = {
            token: localStorage.usertoken
        }
        checkPermissions(data).then(res => {
            if (res.isAdmin) {
                this.setState({isAdmin: true})
                getAllUsers(data).then(res => {
                    if(res.success) {
                        this.setState({users: res.users})
                        
                        let table = document.querySelector("table");
                        let data = Object.keys(res.users[0]);
                        this.generateTable(table, res.users);
                        this.generateTableHead(table, data);
                    }
                })
            } else {
                this.setState({isAdmin: false})
            }
        })
        
    }

    generateTable(table, data) {
        
        
        for (let element of data) {
            let row = table.insertRow();
            for (let key in element) {
                if (key !== 'userID') {
                    let cell = row.insertCell();
                    let text = document.createTextNode(element[key]);
                    cell.appendChild(text);
                }
            }

            var btn = document.createElement('input');
            btn.type = "button";
            btn.className = "btn";
            btn.email = element.email;
            btn.isMod = element.isMod;
            btn.value = (element.isMod ? "Demote" : "Promote");
            btn.onclick = (function(element) {
                var data = {
                    token: localStorage.usertoken,
                    email: element.target.email,
                    promoted: !element.target.isMod
                }
                changeUserPermissions(data).then(res => {
                    if (res.success) {
                        window.location.reload();
                    }
                })
            })
            let cell = row.insertCell();
            cell.appendChild(btn);
        }
    }

    generateTableHead(table, data) {
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let key of data) {
            if (key !== 'userID') {
                let th = document.createElement("th");
                let text = document.createTextNode(key);
                th.appendChild(text);
                row.appendChild(th);
            }
            
        }
        let th = document.createElement("th");
        let text = document.createTextNode("Promote/Demote Mod");
        th.appendChild(text);
        row.appendChild(th);
    }

    render() {
        const empty = 
            <div>
                "You're not an admin"
            </div>
        var table =
            <table style={{width: "100%", border: "1px solid black"}}>
            </table>

        return (
            <div>
                {(this.state.isAdmin) ? table: empty}
                
            </div>
        )
    }
}

export default Users
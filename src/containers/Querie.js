import React from 'react'
import { deleteUserQuery } from './UserFunctions'
import { modifyUserQuery } from './UserFunctions'
import $ from 'jquery'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

export class Querie extends React.Component{

constructor(props){
    super(props)
    this.state = {
        id: props.querie.queryID,
        name: props.querie.queryName,
        content: props.querie.queryContent,
        innerMessage: "",
        openDialog: false,
    }
    this.onChange = this.onChange.bind(this)
    this.onSave = this.onSave.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onView = this.onView.bind(this)
    this.onFocus = this.onFocus.bind(this)
}

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleOpenDeleteConfirmation = () => {
        this.setState({openDialog: true});
    }

    handleCloseDeleteConfirmation = () => {
        this.setState({openDialog: false});
    }

    onSave(){
        const tokenValue = localStorage.usertoken
        const data = {
          token: tokenValue,
          id: this.state.id,
          name: this.state.name
        }
        modifyUserQuery(data).then(res => {
            if (res) {
                if (res.success === true){
                    this.setState({innerMessage: "Updated"}, function(){
                     $('#innerMessage'+this.state.id).css("color", "black")
                     $('#innerMessage'+this.state.id).show()
                     $('#innerMessage'+this.state.id).fadeOut(5000)
                  })
               }else{
                this.setState({innerMessage: "Please login again"}, function(){
                  $('#innerMessage'+this.state.id).css("color", "red")
                  $('#innerMessage'+this.state.id).show()
                  $('#innerMessage'+this.state.id).fadeOut(5000)
                  localStorage.removeItem('usertoken')
              })  
            }
            }
            
   
        })


    }

    onDelete(){
        const tokenValue = localStorage.usertoken
        const data = {
          token: tokenValue,
          id: this.state.id
        }
        

        deleteUserQuery(data).then(res => {
            if (res) {
                if (!res.error){
                    if(res.success)
                        window.location.reload()
            }

            else{
                this.setState({innerMessage: "Please login again"}, function(){
                  $('#innerMessage'+this.state.id).css("color", "red")
                  $('#innerMessage'+this.state.id).show()
                  $('#innerMessage'+this.state.id).fadeOut(5000)
                  localStorage.removeItem('usertoken')
                })  
            }
            
        //window.$("#onRefresh").click()
         }
        })
        
    }

    onView(){
        localStorage.setItem('viewSavedQuery', JSON.stringify(this.state.content))
        this.props.history.push(`/search`)
    }

    onFocus(){
        this.setState({name: ""})
    }

render(){
    return(
        <div className="card" style={{marginTop: "0px"}}>
        <div className="card-header" id="profileCard">

        <div className="row align-items-left">
          <label htmlFor="name" className="p-2" style={{padding: "0px"}}><b>Name:</b></label>
          <div className="col-lg-4 col-md-6 col-sm-6 col-6" id="nameInput" style={{padding:"0px"}}>
              <input value={this.state.name} onFocus={this.onFocus} onChange={this.onChange} type="text" className="form-control" name="name"/>
          </div>
          <div className="col-lg-2 col-md-2 col-sm-2 col-2">
              <button onClick={this.onSave} className="btn btn-dark"><b>Save</b></button>
          </div>
          <div id="messageBox" className="my-auto">
                      <span>
                          <h5><b id={"innerMessage"+this.state.id} style={{display: 'none'}}>{this.state.innerMessage}</b></h5>
                      </span> 
                  </div>
        </div>

          <div className="row align-items-left">
          <button onClick={this.handleOpenDeleteConfirmation} className="ab btn btn-danger"><b>Delete</b></button>
          <button onClick={this.onView} className="ab btn btn-info" ><b>Search</b></button>
          <Dialog
            open={this.state.openDialog}
            onClose={this.handleCloseDeleteConfirmation}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Delete saved query?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you use you want to delete this saved query? There will be no way to recover.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCloseDeleteConfirmation} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.onDelete} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
          
        </div>


    </div>
</div>
    )
}

}
import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root')

export class Article extends React.Component{

    constructor() {
        super()
        this.state = {
            detail: {

            },
            modalIsOpen: false,
            directLink: ''
        }

        this.handleDetails = this.handleDetails.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
    }

    handleDetails(e) {
        e.preventDefault()
        // getDetails(e.target.value).then(res => {
        //     res.content = res.content.split('.\n').map(function(item, key){
        //         return (
        //             <span key={key}>
        //             {item+"."}
        //             <br/>
        //             </span>
        //         )
        //     })
        this.props.article.article_text.split('.\n').map(function(item, key) {
            return (
                <span key={key}>
                {item + "."}
                <br />
                </span>
            )
        })
            this.setState({ detail: this.props.article }, function(){
                //window.$('#exampleModal').modal('show')
                const source_link = this.state.detail.article_url.split(".pdf")[0]
                this.setState({directLink: source_link}, function(){
                    this.setState({modalIsOpen:true})
                })
                
            })
        //})    
      
    }

    openModal(){
        this.setState({modalIsOpen:true})
    }
    
    closeModal(){
        this.setState({modalIsOpen:false})
    }

    render(){
        const formatDate = this.props.article.publish_date.toString().substring(0,10).split("-")
        
        const detail = (
            <div className="modal-content">
      <div className="modal-header">
        <h2 className="col-12 modal-title text-center"><b>Details:</b></h2>
        <button type="button" className="btn btn-danger" onClick={this.closeModal}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        <p><b>Newspaper: </b> { this.state.detail.newspaper }</p><hr></hr>
        <p><b>Publisher: </b> { this.state.detail.publisher }</p><hr></hr>
        <p><b>Title: </b> {this.state.detail.title }</p><hr></hr>
        <p><b>Place: </b> {this.state.detail.city },{this.state.detail.state }</p><hr></hr>
        <p><b>Date: </b> {formatDate[1]+'/'+formatDate[2]+'/'+formatDate[0]}</p><hr></hr>
        <p><b>Article: </b> {this.state.detail.article_text}</p><hr></hr>
        <p><b>Link to Library of Congress:</b></p>
          <a href={this.state.directLink} target="_blank" rel="noopener noreferrer">
          <img className="mx-auto" src={this.state.directLink+"/thumbnail.jpg"} alt=""></img>
        </a>
      </div>
      </div>

        )
        return(
            <div className="container">
            <Modal
            isOpen = {this.state.modalIsOpen}
            onRequestClose = {this.closeModal}
            >
            
            {detail}
            
            </Modal>
            
            <div className="card mt-4">
            <div className="card-header">
                <h6 className="d-inline"><b>Title: </b></h6> {this.props.article.title}
                <button onClick={this.handleDetails} value={this.props.article.id} className="btn btn-info float-right">
                    Details
                </button>
                <br/>
                <span>
                    <h6 className="d-inline"><b>Publication Date: </b></h6> {formatDate[1]+'/'+formatDate[2]+'/'+formatDate[0]}
                </span>
            </div>
            <div className="card-body">
                <h6 className="d-inline"><b>Article: </b></h6>{this.props.article.article_text.substring(0,300)+'...'} 
            </div>
        </div>
        </div>
        )
    }

}

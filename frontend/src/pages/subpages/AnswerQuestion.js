import React from 'react';
import * as nearAPI from 'near-api-js'
import {Modal,CloseButton} from 'react-bootstrap'

const { utils } = nearAPI;

class AnswerQuestion extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.controlHover = options.controlHover
        this.refreshAll = options.refreshAll;
        this.state = {
          show: false,
          id: "",
          title: "",
          description: "",
          content: "",
          lock: ""
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    show(id, title, content, lock){
      this.setState({
        show: true,
        id: id,
        title: title,
        description: content,
        lock: lock
      })
    }

    content_change(e){
        this.setState({
          content: e.target.value
        })
    }

    async answer(){
        this.setState({
            show: false
        })
        this.controlHover({
            show: true,
            message: 'adding answer',
            closeable: false,
            hax: ''
        })
        try {
            let result = await this.nearConnection.answerQuestion(this.state.id, this.state.lock, this.state.content)
            if('answered' in result){
                this.controlHover({
                    show: true,
                    message: 'submit answer success',
                    closeable: true,
                    hax: ''
                })
                this.refreshAll()
            }else{
                this.controlHover({
                    show: true,
                    message: 'submit answer failed',
                    closeable: true,
                    hax: ''
                })
            }
        } catch (error) {
            this.controlHover({
                show: true,
                message: 'submit answer failed',
                closeable: true,
                hax: ''
            })
        }
    }

    render(){
        return (
        <Modal show={this.state.show} backdrop="static">
          <Modal.Header>
            <Modal.Title>answer question</Modal.Title>
              <CloseButton onClick={()=>{this.setState({show:false})}}/>
            </Modal.Header>
          <Modal.Body>
            <div className="form-group">
                <div className="col-sm-13">
                <b><label className="control-label col-sm-13" for="fname">{this.state.title}</label></b>
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-13">
                <label className="control-label col-sm-13" for="fname">{this.state.description}</label>
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-13">
                <textarea className="form-control" rows="10" id="comment" placeholder="answer content"
                value={this.state.content===''? '':this.state.content}
                onChange={this.content_change.bind(this)}
                >
                </textarea>
                </div>
            </div>
            <div className="form-group">        
                <div className="col-sm-offset-2 col-sm-13">
                <button type="submit" className="btn btn-default" onClick={()=>this.answer()}>Submit</button>
                </div>
            </div>
          </Modal.Body>
      </Modal>
        )
    }
}

export default AnswerQuestion;
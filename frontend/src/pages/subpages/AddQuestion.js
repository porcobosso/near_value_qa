import React from 'react';
import * as nearAPI from 'near-api-js'
import {Modal,CloseButton} from 'react-bootstrap'

const { utils } = nearAPI;
var md5 = require('md5-node');

class AddQuestion extends React.Component{
    constructor(options){
        super(options);
        this.nearConnection = options.nearConnection;
        this.controlHover = options.controlHover
        this.setJsonForAddQuestion = options.setJsonForAddQuestion
        this.state = {
          show: false,
          title: '',
          content: '',
          repliers: [],
          jsonOfAddedQuestion: ""
        }
    }

    componentDidMount(){
        this.props.onRef(this)
    }

    show(){
      this.setState({
        show: true
      })
    }

    add(){
      let content = this.state.content
      let title = this.state.title
      let replierRewards = this.state.repliers
      let rewards = []
      let repliers = []
      let totalNear = 0
      for(var i=0;i<replierRewards.length;i++){
        totalNear += parseFloat(replierRewards[i].reward)
        repliers.push(replierRewards[i].replier)
        rewards.push(utils.format.parseNearAmount(replierRewards[i].reward))
      }

      let id = md5(`${this.nearConnection._accountId}_${title}_${content}_${new Date().getTime()}`)
      let lock = this.nearConnection._publickey
      let jsonOfAddQuestion = JSON.stringify({
        id: id,
        title:title,
        content:content,
        repliers: repliers,
        moneys: rewards,
        lock: lock,
        near: totalNear
      })
      this.setJsonForAddQuestion(jsonOfAddQuestion)
      this.setState({
        show: false
      })
      this.controlHover({
        show: true,
        message: 'adding question',
        closeable: false,
        hax: ''
      })
      window.open('confirm')
    }

    addReplier(){
      let repliers = this.state.repliers
      repliers.push({replier:"", reward:0})
      this.setState({
        repliers: repliers
      })
    }
  
    delReplier(index){
      let repliers = this.state.repliers
      let newRepliers = Array()
      for(var i=0;i<repliers.length;i++){
        if(i==index) continue;
        newRepliers.push(repliers[i]);
      }
      this.setState({
        repliers: newRepliers
      })
    }

    title_change(e){
      this.setState({
        title: e.target.value
      });
    }
  
    content_change(e){
      this.setState({
        content: e.target.value
      });
    }
  
    replier_change(index, e){
      let repliers = this.state.repliers
      repliers[index]['replier'] = e.target.value
      this.setState({
        repliers: repliers
      })
    }
  
    reward_change(index, e){
      let repliers = this.state.repliers
      repliers[index]['reward'] = e.target.value
      this.setState({
        repliers: repliers
      })
    }

    render(){
        return (
          <Modal show={this.state.show} backdrop="static">
          <Modal.Header>
            <Modal.Title>adding question</Modal.Title>
            <CloseButton onClick={()=>{this.setState({show:false})}}/>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label className="control-label col-sm-2" for="fname">Title</label>
              <div className="col-sm-13">
                  <input type="text" className="form-control" id="fname" placeholder="question title" name="fname"
                  value={this.state.title===''? '':this.state.title}
                  onChange={this.title_change.bind(this)}
                  ></input>
              </div>
            </div>
            <div className="form-group">
              <label className="control-label col-sm-2" for="comment">Description:</label>
              <div className="col-sm-13">
              <textarea className="form-control" rows="5" id="comment" placeholder="question description"
                value={this.state.content===''? '':this.state.content}
                onChange={this.content_change.bind(this)}
                >
              </textarea>
              </div>
            </div>
            <table className="table">
              <tbody>
                <tr>
                    <th>user</th>
                    <th>bounty</th>
                    <th><button
                          className="btn btn-outline-secondary flow-right"
                          onClick={()=>this.addReplier()}>
                          +
                        </button></th>
                </tr>
                {
                    this.state.repliers?
                        this.state.repliers.map((item,index)=>{
                            return (
                                <tr key={index}>
                                    <td><input value={item.replier}
                                      onChange={this.replier_change.bind(this, index)}
                                    /></td>
                                    <td><input value={item.reward} width="10px"
                                      onChange={this.reward_change.bind(this, index)}
                                    /> Near</td>
                                    <td><button
                                      className="btn btn-outline-secondary flow-right"
                                      onClick={()=>this.delReplier(index)}>
                                      -
                                    </button></td>
                                </tr>
                            )
                        }):null
                }
              </tbody>
            </table>
            <div className="form-group">        
              <div className="col-sm-offset-2 col-sm-13">
              <button type="submit" className="btn btn-default" onClick={()=>this.add()}>Submit</button>
              </div>
            </div>
          </Modal.Body>
        </Modal>)
    }
}

export default AddQuestion;
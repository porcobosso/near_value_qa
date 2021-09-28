import './home.css';
import './custom.css';
import React from 'react';
import {Modal, CloseButton} from 'react-bootstrap'
import HeadBanner from './subpages/HeadBanner'
import AskedQuestion from './subpages/AskedQuestion';
import QuestionDetail from './subpages/QuestionDetail';
import UnAnsweredQuestion from './subpages/UnAnsweredQuestion';
import AnsweredQuestion from './subpages/AnsweredQuestion';
import AnswerQuestion from './subpages/AnswerQuestion';
import NearConnection from './NearConnection';
import AddQuestion from './subpages/AddQuestion';

class Home extends React.Component{

  constructor(options){
    super(options);
    window.actionAfterConfirm = (stateObject) => {
      this.setState (stateObject)
      this.refreshAll()
    }
    this.state = {
      hover: {
        show: false,
        closeable: false,
        message: '',
        hax: ''
      },
      jsonForAddQuestion: "",

      answerQuestionId: "",
      answerQuestionTitle: "",
      answerQuestionDescription: "",
      answerQuestionLock: "",

      answerContent: "",
    };

    this.nearConnection = new NearConnection()
    this.nearConnection.init().then(()=>{
      this.headBanner.loginRefresh()
      this.askedQuestion.loginRefresh()
      this.unAnsweredQuestion.loginRefresh()
      this.answeredQuestion.loginRefresh()
    })
  }

  refreshAll(){
    this.headBanner.refresh()
    this.askedQuestion.refresh()
    this.unAnsweredQuestion.refresh()
    this.answeredQuestion.refresh()
  }

  showQuestionDetail(id){
    this.questionDetail.show(id)
  }

  showAddQuestion(){
    this.addQuestion.show()
  }

  showAnswerQuestion(id, title, content, lock){
    this.answerQuestion.show(id, title, content, lock)
  }

  closeHover(){
    this.setState({
      hover:{
        show:false,
        message:'',
        closeable:true,
        hax:''
      }})
  }

  controlHover(hover){
    this.setState({
      hover: hover
    })
  }

  setJsonForAddQuestion(jsonForAddQuestion){
    this.setState({
      jsonForAddQuestion: jsonForAddQuestion
    })
  }

  async refreshClaimable(){
    if(this.state.signedIn){
      this.setState({
        totalClaimable: await this.nearConnection.totalClaimable()
      })
    }
  }

  render(){
    const hover = (
      <Modal show={this.state.hover.show} centered backdrop="static">
        <Modal.Header>
          <h5>{this.state.hover.message}</h5>
          <CloseButton disabled={!this.state.hover.closeable} onClick={()=>{this.closeHover()}}/>
        </Modal.Header>
        <Modal.Body>
          <div>
              <span>{this.state.hover.hax}</span>
          </div>
        </Modal.Body>
      </Modal>
    )
 
    return (
      <div className="container">
        <HeadBanner nearConnection={this.nearConnection} refreshAll={()=>this.refreshAll()} onRef={(ref)=>{ this.headBanner = ref}}></HeadBanner>
        <AskedQuestion nearConnection={this.nearConnection} showAddQuestion={()=>{this.showAddQuestion()}} showQuestionDetail={(id)=>this.showQuestionDetail(id)} onRef={(ref)=>{ this.askedQuestion = ref}}></AskedQuestion>
        <AddQuestion nearConnection={this.nearConnection} setJsonForAddQuestion={(s)=>{this.setJsonForAddQuestion(s)}} controlHover={(options)=>{this.controlHover(options)}} onRef={(ref)=>{ this.addQuestion = ref}}></AddQuestion>
        <QuestionDetail nearConnection={this.nearConnection} onRef={(ref)=>{ this.questionDetail = ref}}></QuestionDetail>
        <UnAnsweredQuestion nearConnection={this.nearConnection} showAnswerQuestion={(id, title, content, lock)=>{this.showAnswerQuestion(id, title, content, lock)}} onRef={(ref)=>{ this.unAnsweredQuestion = ref}}></UnAnsweredQuestion>
        <AnswerQuestion nearConnection={this.nearConnection} controlHover={(options)=>{this.controlHover(options)}} refreshAll={()=>this.refreshAll()} onRef={(ref)=>{ this.answerQuestion = ref}}></AnswerQuestion>
        <AnsweredQuestion nearConnection={this.nearConnection} controlHover={(options)=>{this.controlHover(options)}} refreshAll={()=>{this.refreshAll()}} onRef={(ref)=>{ this.answeredQuestion = ref}}></AnsweredQuestion>
        <div id="jsonForAddQuestion" hidden>{this.state.jsonForAddQuestion}</div>
        {hover}
      </div>);
  }
}

export default Home;
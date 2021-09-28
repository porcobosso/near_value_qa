import { storage, Context, u128, logging, ContractPromiseBatch, PersistentVector, context, PersistentMap } from "near-sdk-core"
import { AccountId, Amount } from "../../utils"
import { Answer, AnswerInfo, Question, QuestionDetail} from "./model"

const ANSWER_NUM:string = "ANSWER_NUM"
const QUESTION_NUM:string = "QUESTION_NUM"

@nearBindgen
export class Contract {

  /**
   * create question
   * @param id question id
   * @param title question title
   * @param content question description
   * @param repliers designated repliers
   * @param moneys rewards for repliers
   * @param lock public key of question creator
   * @returns question object
   */
  createQuestion(id:string, 
    title:string, 
    content:string,
    repliers: Array<AccountId>, 
    moneys: Array<u128>, 
    lock: string): Question {
    var questioner = Context.sender
    var deposit = Context.attachedDeposit
    assert(repliers.length==moneys.length, 'repliers should be same length as moneys')
    
    // in case data like this:
    // repliers : [A, A, B, C, D]
    // bounties : [1, 1, 1, 2, 3]
    // =======> : [A,    B, C, D]
    //            [2,    1, 2, 3]
    var replierAgg = new Map<AccountId, u128>()
    var bountySum = u128.Zero
    for(var i=0;i<repliers.length;i++){
      assert(u128.ge(moneys[i], u128.Zero), "bounty should greater or equal to zero")
      bountySum = u128.add(bountySum, moneys[i])
      if(!replierAgg.has(repliers[i])){
        replierAgg.set(repliers[i],moneys[i])
      }else{
        replierAgg.set(repliers[i],u128.add(moneys[i], replierAgg.get(repliers[i])))
      }
    }
    assert(u128.eq(deposit, bountySum), 'sum of bounties should be equal to deposit')

    // finish check input parameter
    id = `Q_${id}`
    assert(!storage.contains(id), `question with ${id} already exits!`)

    repliers = replierAgg.keys()
    var question = new Question(id, title, content, questioner, repliers.join(","), lock)

    for(i=0;i<replierAgg.size;i++){
      var replier = repliers[i]
      var money = replierAgg.get(replier)
      question.addAnswer(new Answer(replier, money))
    }
    storage.set(id, question)
    this.createAnswerIndex(id, repliers)
    this.createQuestionIndex(id, questioner)
    if(storage.contains(QUESTION_NUM)){
      var questionNum = storage.getPrimitive<i32>(QUESTION_NUM, 0)
      storage.set<i32>(QUESTION_NUM, questionNum? questionNum+1:1)
    }else{
      storage.set<i32>(QUESTION_NUM, 1)
    }
    return question
  }

  /**
   * create answer index for quick search
   *   key: user id
   *   value: array of quesiton id with user as replier
   * @param questionId quesiton id
   * @param repliers designated repliers
   */
  private createAnswerIndex(questionId:string, repliers: AccountId[]):void{
    for(var i=0;i<repliers.length;i++){
      var ua = `UA_${repliers[i]}`
      if(storage.contains(ua)){
        var userAnswers = storage.get<PersistentVector<string>>(ua)
        userAnswers = userAnswers!
        userAnswers.push(questionId)
        storage.set(ua, userAnswers)
      }else{
        var newUserAnswers = new PersistentVector<string>(ua)
        newUserAnswers.push(questionId)
        storage.set(ua, newUserAnswers)
      }
    }
  }

  /**
   * create question index for quick search
   *    key: user id
   *    value: array of user asked quesiton id
   * @param questionId quesiton id
   * @param questioner question creator id
   */
  private createQuestionIndex(questionId:string, questioner: AccountId):void{
    var uq = `UQ_${questioner}`
    if(storage.contains(uq)){
      var userQuestions = storage.get<PersistentVector<AccountId>>(uq)
      userQuestions = userQuestions!
      userQuestions.push(questionId)
      storage.set(uq, userQuestions)
    }else{
      var newUserQuestions = new PersistentVector<AccountId>(uq)
      newUserQuestions.push(questionId)
      storage.set(uq, newUserQuestions)
    }
  }

  /**
   * save answer content
   * @param questionId question id
   * @param contentForQuestioner encrypted answer for question creator
   * @param contentForReplier encrypted answer for answer creator
   * @returns 
   */
  answerQuestion(questionId:string,contentForQuestioner:string,contentForReplier:string): Answer{
    var replier = Context.sender
    assert(storage.contains(questionId), `question with ${questionId} not exits!`)
    var question: Question|null = storage.get<Question>(questionId)
    question = question!
    assert(question.answers.contains(replier),`${replier} not allowed to answer this question!`)
    var answer = question.answers.get(replier)
    answer = answer!
    answer.contentForQuestioner=contentForQuestioner
    answer.contentForReplier=contentForReplier
    if(!answer.answered){
      if(storage.contains(ANSWER_NUM)){
        var answerNum = storage.getPrimitive<i32>(ANSWER_NUM, 0)
        storage.set<i32>(ANSWER_NUM, answerNum? answerNum+1:1)
      }else{
        storage.set<i32>(ANSWER_NUM, 1)
      }
    }
    answer.answered = true
    question.answers.set(replier, answer)
    storage.set(question.id, question)
    return answer
  }

  /**
   * claim reward for question
   * @param questionId question id
   */
  claimReward(questionId:string): void{
    var replier = Context.sender
    assert(storage.contains(questionId), `question with ${questionId} not exits!`)
    var question: Question|null = storage.get<Question>(questionId)
    question = question!
    assert(question.answers.contains(replier),`${replier} not allowed to access this question!`)
    var answer = question.answers.get(replier)
    answer = answer!
    assert(answer.answered, "please answer this question first!")
    assert(!answer.claimed,`you have already claimed reward!`)
    answer.claimed=true
    question.answers.set(answer.replier, answer)
    storage.set(question.id, question)
    ContractPromiseBatch.create(replier).transfer(answer.reward)
    logging.log(`reward claimed: ${answer.reward}`)
  }

  /**
   * user claimable reward
   * @param user user id
   */
  claimAmount(user: AccountId):u128{
    var answerInfos = this.listAnsweredQuestions(user, 10000)
    var amount:u128 = u128.Zero
    for(var i=0;i<answerInfos.length;i++){
      var answerInfo = answerInfos[i]
      if((!answerInfo.answered)||answerInfo.claimed){
        continue
      }
      if(answerInfo.reward){
        var reward = answerInfo.reward!
        amount = u128.add(amount, reward)
      }
    }
    return amount
  }

  /**
   * claim all reward
   * @returns 
   */
  claimAll():void{
    var replier = Context.sender
    var answerInfos = this.listAnsweredQuestions(replier, 10000)
    if(answerInfos.length==0){
      return
    }
    var amount = u128.Zero
    for(var i=0;i<answerInfos.length;i++){
      var answerInfo = answerInfos[i]
      if(u128.le(answerInfo.reward!, u128.Zero)){
        continue
      }
      var reward = answerInfo.reward!
      amount = u128.add(amount, reward)
      var question = storage.get<Question>(answerInfo.questionId)
      question = question!
      var answer = question.answers.get(answerInfo.replier)
      answer = answer!
      answer.claimed = true
      question.answers.set(answer.replier, answer)
      storage.set(question.id, question)
    }
    if(u128.gt(amount, u128.Zero)){
      ContractPromiseBatch.create(replier).transfer(amount)
      logging.log(`all reward claimed: ${amount}`)
    }
  }

  /**
   * show question detail
   * @param id question id
   * @returns question detail
   */
  showQuestion(id:string):QuestionDetail|null{
    assert(id.startsWith("Q_"), "invalid question id")
    if(!storage.contains(id)){
      return null
    }
    var question = storage.get<Question>(id)
    question = question!
    return new QuestionDetail(question)
  }

  /**
   * show user's answer for question
   * @param id question id
   * @param user user id
   * @returns 
   */
  showAnswer(id:string, user: AccountId):Answer|null{
    assert(id.startsWith("Q_"), "invalid question id")
    if(!storage.contains(id)){
      return null
    }
    var question = storage.get<Question>(id)
    question = question!
    return question.answers.get(user)
  }

  /**
   * asked question count
   * @returns
   */
  questionCount():i32{
    return storage.getPrimitive<i32>(QUESTION_NUM, 0)
  }

  /**
   * answer count
   * @returns
   */
  answerCount():i32{
    return storage.getPrimitive<i32>(ANSWER_NUM, 0)
  }

  /**
   * list user asked questions
   * @param user user id
   * @param limit limit return size of quesitons
   * @returns 
   */
  listMyAskedQuestions(user:AccountId, limit:i32):Array<Question>{
    var uq = `UQ_${user}`
    if(!storage.contains(uq)){
      return new Array<Question>(0)
    }else{
      var userQuestions = storage.get<PersistentVector<AccountId>>(uq)
      userQuestions = userQuestions!

      const arrLen = min(userQuestions.length, limit)
      const questionArr = new Array<Question>(arrLen)

      const startIndex = userQuestions.length - arrLen
      for(var i=0;i<arrLen;i++){
        var question = storage.get<Question>(userQuestions[i+startIndex])
        question = question!
        questionArr[i] = question
      }
      return questionArr.reverse()
    }
  }

  /**
   * list user unanswered questions
   * @param user user id
   * @param limit limit return size of quesitons
   * @returns 
   */
  listUnAnsweredQuestions(user:AccountId, limit:u32):Array<AnswerInfo>{
    return this.listMyReplQuestions(user, 0, limit)
  }

  /**
   * list user answered questions
   * @param user user id
   * @param limit limit return size of quesitons
   * @returns 
   */
  listAnsweredQuestions(user:AccountId, limit:u32):Array<AnswerInfo>{
    return this.listMyReplQuestions(user, 1, limit)
  }

  /**
   * list questions with user as replier
   * @param user user id
   * @param limit limit return size of quesitons
   * @returns 
   */
  listAllRelQuestions(user:AccountId ,limit:u32):Array<AnswerInfo>{
    return this.listMyReplQuestions(user, -1, limit)
  }

  /**
   * list questions according to answer type
   * @param user user id
   * @param limit limit return size of quesitons
   * @returns 
   */
  private listMyReplQuestions(user:AccountId, answerType:i8, limit:i32):Array<AnswerInfo>{
    var ua = `UA_${user}`
    if(!storage.contains(ua)){
      return new Array<AnswerInfo>(0)
    }else{
      logging.log(`${user} has rel question`)
      var userQuestions = storage.get<PersistentVector<AccountId>>(ua)
      userQuestions = userQuestions!
      logging.log(`get ${userQuestions.length} questions`)

      var questionArrTmp = new Array<AnswerInfo>(limit)
      var j = 0
      for(var i=userQuestions.length-1;i>=0&&j<limit;i--){
        logging.log(`trying get ${i} question: ${userQuestions[i]}`)
        var question = storage.get<Question>(userQuestions[i])
        question = question!
        logging.log(`get ${i} question!`)
        var answer = question.answers.get(user)
        answer = answer!
        if(answerType==-1){
          //don't care answered or not
          questionArrTmp[j++] = new AnswerInfo(question, user)
        }else if(answerType==0&&!answer.answered){
          // not answered
          questionArrTmp[j++] = new AnswerInfo(question, user)
        }else if(answerType==1&&answer.answered){
          questionArrTmp[j++] = new AnswerInfo(question, user)
        }
      }
      if(j==limit){
        return questionArrTmp
      }
      var questionArr = new Array<AnswerInfo>(j);
      for(i=0;i<j;i++){
        questionArr[i]=questionArrTmp[i];
      }
      return questionArr
    }
  }
}
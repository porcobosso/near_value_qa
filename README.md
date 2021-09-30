# value QA
- Near Certified Developer Course Demo
- Users can ask questions, designate other users to answer questions, and give appropriate rewards
- Only designated users can answer questions and receive rewards
- The answer content is only visible to the questioner and the respondent

# code description
```
- backend/src/singleton
 - model.ts 
 - index.ts
```

```
- frontend/src
 - modules/confirm/pages
  - home.js: confirm page for deposit
 - pages
  - NearConnection.js: near contract interface
  - home.js: main page
  - subpages
    - HeadBanner.js: head banner
    - AskedQuestion.js: user asked question list
    - UnAnsweredQuestion.js: user unanswered question list
    - AnsweredQuestion.js: user answered question list
    - AddQuestion.js: question add page
    - AnswerQuestion.js: question answer page
    - QuestionDetail.js: question detail page
```

# deploy contract
> yarn build:release
> near deploy {contract.address} build/release/singleton.wasm

# frontend start
> npm run dev
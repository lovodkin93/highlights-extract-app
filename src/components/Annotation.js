import { useState } from 'react';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import ResponsiveAppBar from './ResponsiveAppBar';
import { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler } from './Annotation_event_handlers';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';
import { ArrowForwardIosTwoTone } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';

import Fab from '@mui/material/Fab';




const Annotation = ({task_id, 
                    doc_json, summary_json, 
                    all_lemma_match_mtx, important_lemma_match_mtx,
                    StateMachineState, SetStateMachineState,
                    handleErrorOpen, isPunct,
                    toggleSummaryHighlight, toggleDocHighlight, 
                    SetSummaryShadow, SetSummaryUnderline, 
                    boldStateHandler,
                    SubmitHandler,
                    CurrSentInd,
                    InfoMessage,
                    MachineStateHandlerWrapper
                   }) => {

  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);

  const nextButtonText = () => {
    if(StateMachineState==="Start"){return "Start";}
    if(StateMachineState==="Choose Span"){return "Highlight";}
    if(StateMachineState==="Highlight"){return "Next Span";}
    if(StateMachineState==="Revise Sentence"){return "Next Sentence";}
    if(StateMachineState==="Revise All"){return "Submit";}
  }

  const nextButtonID = () => {
    if(StateMachineState==="Start"){return "state-Start";}
    if(StateMachineState==="Choose Span"){return "state-ChooseSpan";}
    if(StateMachineState==="Highlight"){return "state-Highlight";}
    if(StateMachineState==="Revise Sentence"){return "state-ReviseSentence";}
    if(StateMachineState==="Revise All"){return "state-ReviseAll";}
  };


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const DocMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "Start"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (StateMachineState == "Choose Span"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Please choose a summary span first. Then press \"HIGHLIGHT\" to continue."});
    } else {
      DocMouseClickHandler({ tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
    }
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "Start"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0){ // check if span chosen is from the correct sentence first.
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } else if (StateMachineState === "Choose Span"){
      SummaryUnderlineHandler({ tkn_id, CurrSentInd, SetSummaryUnderline, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
    } else if (StateMachineState === "Highlight"){
      SummaryHighlightHandler({ summary_json, tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
    } else {
      alert("state not defined yet!");
    }
  }



  return (
      <>
        <ResponsiveAppBar
           title={"Annotation"} 
           StateMachineState = {StateMachineState} 
           MachineStateHandler={MachineStateHandlerWrapper}
           boldStateHandler={boldStateHandler}
        />
        {InfoMessage !== "" && (<Alert severity="info" color="secondary">{InfoMessage}</Alert>)}
        <div id="doc-text">
            <h3>Document</h3>
            <body>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json} DocMouseClickHandler={DocMouseClickHandlerWrapper} />
            ))};
            </body>
        </div>
        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} SummaryMouseClickHandler={SummaryMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>
        {StateMachineState !== "Revise All" && (
          <Fab className='NextStateButton' id={nextButtonID()} color="success" variant="extended" onClick={MachineStateHandlerWrapper}>
            {nextButtonText()}
            {StateMachineState !== "Start" && (<ArrowForwardIosTwoTone />) }
          </Fab>
        )}
        {StateMachineState === "Revise All" && (
          <Fab id="SubmitButton" color="success" variant="extended" onClick={SubmitHandler}>
              {nextButtonText()}
              <SendIcon sx={{ margin: '10%' }}  />
          </Fab>
        )}
      </>
  )
}

export default Annotation
import { useState, useEffect } from 'react';
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
                    toggleSummarySpanHighlight, toggleDocSpanHighlight, 
                    SetSummaryShadow, SetSummaryUnderline, 
                    boldState, boldStateHandler,
                    SubmitHandler,
                    CurrSentInd,
                    InfoMessage,
                    MachineStateHandlerWrapper,
                    AlignmentCount, SetAlignmentCount,
                   }) => {



  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);





  const nextButtonText = () => {
    if(StateMachineState==="START"){return "START";}
    if(StateMachineState==="ANNOTATION"){return "CONFIRM ALIGNMENT";}
    if(StateMachineState==="SENTENCE END"){return "CONFIRM ALIGNMENT & NEXT SENTENCE";}
    if(StateMachineState==="SUMMARY END"){return "SUBMIT";}
  }

  const nextButtonID = () => {
    if(StateMachineState==="START"){return "state-START";}
    if(StateMachineState==="ANNOTATION"){return "state-ANNOTATION";}
    if(StateMachineState==="SENTENCE END"){return "state-SENTENCE-END";}
    if(StateMachineState==="SUMMARY END"){return "state-SUMMARY-END";}
  };


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const DocMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "START"){ // during START state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else {
      DocMouseClickHandler({ tkn_id, toggleDocSpanHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
    }
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "START"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0){ // check if span chosen is from the correct sentence first.
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState)){
      SummaryHighlightHandler({ summary_json, tkn_id, toggleSummarySpanHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
     } else {
      console.log(`AVIVSL: state is ${StateMachineState}`);
      alert("state not defined yet!");
    }
  }



  // reset clickings between states
  useEffect(() => {
    SetDocMouseDownStartID("-1");
    SetDocMouseclicked(false);
    SetSummaryMouseDownStartID("-1");
    SetSummaryMouseclicked(false);
  }, [StateMachineState]);

  return (
      <>
        <ResponsiveAppBar
           title={"Annotation"} 
           StateMachineState = {StateMachineState} 
           MachineStateHandler={MachineStateHandlerWrapper}
           boldState={boldState}
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
        {StateMachineState !== "SUMMARY END" && (
          <Fab className='NextStateButton' id={nextButtonID()} color="success" variant="extended" onClick={MachineStateHandlerWrapper}>
            {nextButtonText()}
            {StateMachineState !== "START" && (<ArrowForwardIosTwoTone />) }
          </Fab>
        )}
        {StateMachineState === "SUMMARY END" && (
          <Fab id="SubmitButton" color="success" variant="extended" onClick={SubmitHandler}>
              {nextButtonText()}
              <SendIcon sx={{ margin: '10%' }}  />
          </Fab>
        )}
      </>
  )
}

export default Annotation
import { useState, useEffect } from 'react';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import ResponsiveAppBar from './ResponsiveAppBar';
import { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler } from './Annotation_event_handlers';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';
import { ArrowBackIosTwoTone, ArrowForwardIosTwoTone } from '@mui/icons-material';
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
                    oldHighlightState, oldHighlightStateHandler
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
    if(StateMachineState==="REVISE CLICKED"){return "CONFIRM ALIGNMENT";}
  }

  const nextButtonID = () => {
    if(StateMachineState==="START"){return "state-START";}
    if(StateMachineState==="ANNOTATION"){return "state-ANNOTATION";}
    if(StateMachineState==="SENTENCE END"){return "state-SENTENCE-END";}
    if(StateMachineState==="SUMMARY END"){return "state-SUMMARY-END";}
    if(StateMachineState==="REVISE CLICKED"){return "state-REVISE-CLICKED";}
  };


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const DocMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (StateMachineState === "REVISE HOVER"){
      MachineStateHandlerWrapper({clickedWordInfo:["doc", tkn_id]});
    } else {
      DocMouseClickHandler({ tkn_id, toggleDocSpanHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
    }
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "START"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (StateMachineState === "REVISE HOVER"){
      MachineStateHandlerWrapper({clickedWordInfo:["summary", tkn_id]});
    } else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(StateMachineState==="REVISE CLICKED")){ // check if span chosen is from the correct sentence first.
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED"].includes(StateMachineState)){
      SummaryHighlightHandler({ summary_json, tkn_id, toggleSummarySpanHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
     } else {
      console.log(`AVIVSL: state is ${StateMachineState}`);
      alert(`state not defined yet! state: ${StateMachineState}`);
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
           MachineStateHandlerWrapper={MachineStateHandlerWrapper}
           boldState={boldState}
           boldStateHandler={boldStateHandler}
           oldHighlightState={oldHighlightState}
           oldHighlightStateHandler={oldHighlightStateHandler}
        />
        {InfoMessage !== "" && (<Alert severity="info" color="secondary">{InfoMessage}</Alert>)}
        <div id="doc-text">
            <h3>Document</h3>
            <body>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} />
            ))};
            </body>
        </div>
        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} SummaryMouseClickHandlerWrapper={SummaryMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>
        {StateMachineState === "REVISE CLICKED" && (
          <Fab className='NextStateButton' id="REVISE-CLICKED-BACK-BTN" color="secondary" variant="extended" onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER", isBackBtn:true })}>
            <ArrowBackIosTwoTone />
            BACK
          </Fab>
        )}
        {!["REVISE HOVER", "SUMMARY END"].includes(StateMachineState) && (
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
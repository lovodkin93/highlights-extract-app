import { useState, useEffect } from 'react';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import ResponsiveAppBar from './ResponsiveAppBar';
import { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler } from './Annotation_event_handlers';
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
                    boldState, boldStateHandler,
                    SubmitHandler,
                    CurrSentInd,
                    InfoMessage,
                    MachineStateHandlerWrapper,
                    AlignmentCount, SetAlignmentCount,
                    oldAlignmentState, oldAlignmentStateHandler,
                    reviseHoverHandler,
                    DocOnMouseDownID, SetDocOnMouseDownID, SummaryOnMouseDownID, SetSummaryOnMouseDownID,
                    setDocOnMouseDownActivated, docOnMouseDownActivated, setSummaryOnMouseDownActivated, summaryOnMouseDownActivated, setHoverActivatedId
                   }) => {



  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);

  const [summaryOnMouseDownInCorrectSent, setSummaryOnMouseDownInCorrectSent] = useState(true)


  const nextButtonText = () => {
    if(StateMachineState==="START"){return "START";}
    if(StateMachineState==="ANNOTATION"){return "CONFIRM ALIGNMENT";}
    if(StateMachineState==="SENTENCE START"){return "CONFIRM ALIGNMENT";}
    if(StateMachineState==="SENTENCE END"){return "CONFIRM ALIGNMENT & NEXT SENTENCE";}
    if(StateMachineState==="SUMMARY END"){return "SUBMIT";}
    if(StateMachineState==="REVISE CLICKED"){return "CONFIRM ALIGNMENT";}
  }

  const nextButtonID = () => {
    if(StateMachineState==="START"){return "state-START";}
    if(StateMachineState==="ANNOTATION"){return "state-ANNOTATION";}
    if(StateMachineState==="SENTENCE START"){return "state-SENTENCE-START";}
    if(StateMachineState==="SENTENCE END"){return "state-SENTENCE-END";}
    if(StateMachineState==="SUMMARY END"){return "state-SUMMARY-END";}
    if(StateMachineState==="REVISE CLICKED"){return "state-REVISE-CLICKED";}
  };


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });




  const DocOnMouseDownHandler = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      SetDocOnMouseDownID(tkn_id);
    }
  }

  const SummaryOnMouseDownHandler = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } 
    else if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id > CurrSentInd}).length !== 0)) {
      handleErrorOpen({ msg : "Span chosen cannot be from future sentences. Only from current or past sentences" });
      setSummaryOnMouseDownInCorrectSent(false);
    } 
    else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))){ // check if span chosen is from the correct sentence first.
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
      setSummaryOnMouseDownInCorrectSent(false);
    } 
    else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      SetSummaryOnMouseDownID(tkn_id);
    }
  }

  const DocOnMouseUpHandler = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      const min_ID =  (DocOnMouseDownID > tkn_id) ? tkn_id : DocOnMouseDownID;
      const max_ID =  (DocOnMouseDownID > tkn_id) ? DocOnMouseDownID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleDocSpanHighlight(chosen_IDs);
      SetDocOnMouseDownID("-1"); 
    }
  }

  const SummaryOnMouseUpHandler = (tkn_id) => {
    if (StateMachineState == "START"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    }
    else if (StateMachineState == "REVISE HOVER"){ // during "REVISE HOVER" state only clicking
      console.log("during \"REVISE HOVER\" state can only click old alignments.")
    }   
    else if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id > CurrSentInd}).length !== 0)) {
      handleErrorOpen({ msg : "Span chosen cannot be from future sentences. Only from current or past sentences" });
    } 
    else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))){ // check if span chosen is from the correct sentence first.
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } 
    else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState) && summaryOnMouseDownInCorrectSent){
      const min_ID =  (SummaryOnMouseDownID > tkn_id) ? tkn_id : SummaryOnMouseDownID;
      const max_ID =  (SummaryOnMouseDownID > tkn_id) ? SummaryOnMouseDownID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleSummarySpanHighlight(chosen_IDs);
      SetSummaryOnMouseDownID("-1");
     } 
     else {
      if (summaryOnMouseDownInCorrectSent) {console.log(`AVIVSL: state is ${StateMachineState}`); alert(`state not defined yet! state: ${StateMachineState}`);}
    }

    // reset the states
    setSummaryOnMouseDownInCorrectSent(true)
    SetSummaryOnMouseDownID("-1")
  }



  const DocMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } 
    else if (StateMachineState === "REVISE HOVER"){
      if (doc_json.filter((word) => {return word.tkn_id === tkn_id})[0].alignment_id.length > 0){
        MachineStateHandlerWrapper({clickedWordInfo:["doc", tkn_id]});
      }
    } 
    else {
      DocMouseClickHandler({ tkn_id, toggleDocSpanHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
    }
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState == "START"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } 
    else if (StateMachineState === "REVISE HOVER"){
      if (summary_json.filter((word) => {return word.tkn_id === tkn_id})[0].alignment_id.length > 0) {
        MachineStateHandlerWrapper({clickedWordInfo:["summary", tkn_id]});
      }
    } 
    else if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id > CurrSentInd}).length !== 0)) {
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen cannot be from future sentences. Only from current or past sentences" });
    } 
    else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(StateMachineState==="REVISE CLICKED")){ // check if span chosen is from the correct sentence first.
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } 
    else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)){
      SummaryHighlightHandler({ summary_json, tkn_id, toggleSummarySpanHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
     } 
     else {
      console.log(`AVIVSL: state is ${StateMachineState}`);
      alert(`state not defined yet! state: ${StateMachineState}`);
    }
  }

  // for the "REVISE HOVER" state
  const reviseHoverHandlerWrapper = ({inOrOut, curr_alignment_id}) => {
    if (StateMachineState === "REVISE HOVER"){
      reviseHoverHandler({inOrOut, curr_alignment_id});
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
           oldAlignmentState={oldAlignmentState}
           oldAlignmentStateHandler={oldAlignmentStateHandler}
        />
        {InfoMessage !== "" && (<Alert severity="info" color="secondary">{InfoMessage}</Alert>)}
        <div id="doc-text">
            <h3>Document</h3>
            <body>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json}  StateMachineState={StateMachineState} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} reviseHoverHandlerWrapper={reviseHoverHandlerWrapper} DocOnMouseDownHandler={DocOnMouseDownHandler} DocOnMouseUpHandler={DocOnMouseUpHandler} setDocOnMouseDownActivated={setDocOnMouseDownActivated} docOnMouseDownActivated={docOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId}/>
            ))};
            </body>
        </div>
        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json}  StateMachineState={StateMachineState} SummaryMouseClickHandlerWrapper={SummaryMouseClickHandlerWrapper} reviseHoverHandlerWrapper={reviseHoverHandlerWrapper} SummaryOnMouseDownHandler={SummaryOnMouseDownHandler} SummaryOnMouseUpHandler={SummaryOnMouseUpHandler} setSummaryOnMouseDownActivated={setSummaryOnMouseDownActivated} summaryOnMouseDownActivated={summaryOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId}/> //AVIVSL: TODO: add summary alignment helper here
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
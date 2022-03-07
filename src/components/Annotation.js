import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import Header from './Header';
import ResponsiveAppBar from './ResponsiveAppBar';
import { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler } from './Annotation_event_handlers';
import { NextStateButton } from './NextStateButton';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';
import Button from '@mui/material/Button';
import { ArrowForwardIosTwoTone } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Grid from "@material-ui/core/Grid";

import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';




const Annotation = ({task_id, 
                    doc_json, summary_json, 
                    all_lemma_match_mtx, important_lemma_match_mtx,
                    StateMachineState, SetStateMachineState,
                    handleErrorOpen, 
                    toggleSummaryHighlight, toggleDocHighlight, 
                    SetSummaryShadow, SetSummaryUnderline, 
                    boldStateHandler,
                   }) => {
  // console.log(doc_json)
  // console.log(summary_json)
  // console.log("now all")
  // console.log(all_lemma_match_mtx)
  // console.log("now important")
  // console.log(important_lemma_match_mtx)
  const [showAddTask, setShowAddTask] = useState(false)
  
  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);
  const [CurrSentInd, SetCurrSentInd] = useState(-1);
  const [InfoMessage, SetInfoMessage] = useState("");

  const nextButtonText = () => {
    if(StateMachineState==="Start"){return "Start";}
    if(StateMachineState==="Choose Span"){return "Highlight"}
    if(StateMachineState==="Highlight"){return "Next Span"}
  }


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
    console.log(summary_json.filter((word) => {return word.tkn_id === tkn_id && !word.sent_id !== CurrSentInd}).length);
    console.log(CurrSentInd);
    if (StateMachineState == "Start"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0){ // check if span chosen is from the correct sentence first.
      SetSummaryMouseDownStartID("-1");
      SetSummaryMouseclicked(false);
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } else if (StateMachineState === "Choose Span"){
      SummaryUnderlineHandler({ tkn_id, CurrSentInd, SetSummaryUnderline, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
    } else if (StateMachineState === "Highlight"){
      SummaryHighlightHandler({ tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
    } else {
      alert("state not defined yet!");
    }
  }

  const MachineStateHandlerWrapper = () => {
    MachineStateHandler({ summary_json,
                          StateMachineState, SetStateMachineState,
                          SetInfoMessage, handleErrorOpen,
                          CurrSentInd, SetCurrSentInd, SetSummaryShadow });
  }



  return (
      <>
        {/* <Header
          title={"Annotation"}
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask}
        /> */}
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
        <Fab id="NextStateButton" color="success" variant="extended" onClick={MachineStateHandlerWrapper}>
          {nextButtonText()}
          <ArrowForwardIosTwoTone />
        </Fab>
      </>
  )
}

export default Annotation
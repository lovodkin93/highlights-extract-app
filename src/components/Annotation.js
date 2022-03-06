import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocWord from './DocWord'
import SummaryWord from './SummaryWord'
import Header from './Header'
import ResponsiveAppBar from './ResponsiveAppBar'
import { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler } from './Annotation_event_handlers'
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';


const Annotation = ({task_id, doc_json, summary_json, all_lemma_match_mtx, important_lemma_match_mtx, handleErrorOpen, toggleSummaryHighlight, toggleDocHighlight, SetSummaryShadow, SetSummaryUnderline}) => {
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
  const [StateMachineState, SetStateMachineState] = useState("Start");
  const [CurrSentInd, SetCurrSentInd] = useState(-1);
  const [InfoMessage, SetInfoMessage] = useState("");


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const DocMouseClickHandlerWrapper = (tkn_id) => {
    DocMouseClickHandler({ tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    if (StateMachineState === "Sentence Start"){
      SummaryUnderlineHandler({ tkn_id, CurrSentInd, SetSummaryUnderline, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
    }
    else{
      SummaryHighlightHandler({ tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
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
        />
        {InfoMessage !== "" && (<Alert severity="info" color="secondary">{InfoMessage}</Alert>)}
        <div id="doc-text">
            <h3>Document</h3>
            <p>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json} DocMouseClickHandler={DocMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>

        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} SummaryMouseClickHandler={SummaryMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>
      </>
  )
}

export default Annotation
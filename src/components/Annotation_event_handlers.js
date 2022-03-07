import { useState, useEffect } from 'react'

const DocMouseClickHandler = ({tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked}) => {
    const update_mouse_tkn = DocMouseclicked ? "-1" : tkn_id;
    if (DocMouseclicked){
      const min_ID =  (DocMouseclickStartID > tkn_id) ? tkn_id : DocMouseclickStartID;
      const max_ID =  (DocMouseclickStartID > tkn_id) ? DocMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleDocHighlight(chosen_IDs);     
    }
    SetDocMouseDownStartID(update_mouse_tkn);
    SetDocMouseclicked(!DocMouseclicked);
  }


  const SummaryHighlightHandler = ({tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked}) => {  
    const update_mouse_tkn = SummaryMouseclicked ? "-1" : tkn_id;
    if (SummaryMouseclicked){
      const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
      const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleSummaryHighlight(chosen_IDs);     
    }
    SetSummaryMouseDownStartID(update_mouse_tkn);
    SetSummaryMouseclicked(!SummaryMouseclicked);
  }

  const SummaryUnderlineHandler = ({ tkn_id, CurrSentInd, SetSummaryUnderline, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked }) => {  
    const update_mouse_tkn = SummaryMouseclicked ? "-1" : tkn_id;
    if (SummaryMouseclicked){
      const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
      const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      SetSummaryUnderline(chosen_IDs);  
    }
    SetSummaryMouseDownStartID(update_mouse_tkn);
    SetSummaryMouseclicked(!SummaryMouseclicked);
  }





  const MachineStateHandler = ({ summary_json,
                                 StateMachineState, SetStateMachineState,
                                 SetInfoMessage, handleErrorOpen,
                                  CurrSentInd, SetCurrSentInd, SetSummaryShadow }) => {
    // "Start" state --> "Choose Span" state
    if (StateMachineState === "Start"){
        console.log(`Old state: \"Start\"; New state: \"Choose Span\" with SentInd=${CurrSentInd+1}.`);
        SetStateMachineState("Choose Span");
        SetSummaryShadow(CurrSentInd+1);
        SetCurrSentInd(CurrSentInd+1);
        SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
    }
    // "Choose Span" state --> "Highlight" state
    if (StateMachineState === "Choose Span"){
        if(summary_json.filter((word) => {return word.underlined && word.sent_id === CurrSentInd}).length === 0){
            handleErrorOpen({ msg : "No span was chosen." });
        } else{
            console.log(`Old state: \"Choose Span\"; New state: \"Highlight\."`);
            SetStateMachineState("Highlight");
            SetInfoMessage("");
        }
    }
    // "Highlight" state --> "Choose Span" state 
    // TODO: AVIVSL: add also when end of sentence and end of file here
    if (StateMachineState === "Highlight"){
        if(summary_json.filter((word) => {return word.underlined && !word.highlighted}).length > 0){
            handleErrorOpen({ msg : "Not all summary span was highlighted." });
        } else {
            console.log(`Old state: \"Highlight\"; New state: \"Choose Span\".`);
            SetStateMachineState("Choose Span");
            SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
        }
    }
  }

  export { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler }

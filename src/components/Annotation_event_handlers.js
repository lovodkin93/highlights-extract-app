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
      SetSummaryUnderline(chosen_IDs, CurrSentInd);  
    }
    SetSummaryMouseDownStartID(update_mouse_tkn);
    SetSummaryMouseclicked(!SummaryMouseclicked);
  }





  const MachineStateHandler = ({ summary_json,
                                 StateMachineState, SetStateMachineState,
                                 SetInfoMessage, handleErrorOpen,
                                  CurrSentInd, SetCurrSentInd, SetSummaryShadow }) => {
    if (StateMachineState === "Start"){
        console.log(`Old state: \"Start\"; New state: \"Sentence Start\" with SentInd=${CurrSentInd+1}`);
        SetStateMachineState("Sentence Start");
        SetSummaryShadow(CurrSentInd+1);
        SetCurrSentInd(CurrSentInd+1);
        SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
    }
    if (StateMachineState === "Sentence Start"){
        if(summary_json.filter((word) => {return word.underlined && word.sent_id === CurrSentInd}).length === 0){
            handleErrorOpen({ msg : "No span was chosen" });
        }
        else{
            console.log(`Old state: \"Sentence Start\"; New state: \"Highlight\"`);
            SetStateMachineState("Highlight");
        }
    }
  }

  export { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler }

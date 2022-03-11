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


  const SummaryHighlightHandler = ({summary_json, tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked}) => {  
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


  const allSentHighlighted = (summary_json, CurrSentInd, isPunct) => {
    console.log(summary_json.filter((word) => { return (word.sent_id === CurrSentInd) && (!word.highlighted) && (!isPunct(word.word))}));
    return (summary_json.filter((word) => { return (word.sent_id === CurrSentInd) && (!word.highlighted) && (!isPunct(word.word))}).length === 0);
  }

  const allSummaryHighlighted = (summary_json, CurrSentInd, isPunct) => {
    const isLastSent = (Math.max.apply(Math, summary_json.map(word => { return word.sent_id; })) === CurrSentInd)
    return (allSentHighlighted(summary_json, CurrSentInd, isPunct) && isLastSent)
  }



  const MachineStateHandler = (summary_json,
                                 StateMachineState, SetStateMachineState,
                                 SetInfoMessage, handleErrorOpen, isPunct,
                                 CurrSentInd, SetCurrSentInd, SetSummaryShadow, SetSummaryUnderline,
                                 boldStateHandler,
                                 forceState) => {
    // "Start" state --> "Choose Span" state
    if (StateMachineState === "Start"){
        console.log(`Old state: \"Start\"; New state: \"Choose Span\" with SentInd=${CurrSentInd+1}.`);
        SetStateMachineState("Choose Span");
        SetSummaryShadow(CurrSentInd+1);
        SetCurrSentInd(CurrSentInd+1);
        SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
    }
    // "Choose Span" state --> "Old Highlight" state
    else if (forceState === "Choose Span" || StateMachineState === "Choose Span"){
        if((summary_json.filter((word) => {return word.underlined && word.sent_id === CurrSentInd}).length === 0) && (forceState !== "Choose Span")){
            handleErrorOpen({ msg : "No span was chosen." });
        } else{
            console.log(`Old state: \"Choose Span\"; New state: \"Old Highlight\".`);
            SetStateMachineState("Old Highlight");
            boldStateHandler(undefined, 2); // set the boldstate to boldfacing matches of span.
            SetInfoMessage("");
        }
    }
    // "Old Highlight" state --> "Revise All"/"Revise Sentence"/"Choose Span" state 
    else if (forceState === "Old Highlight" || StateMachineState === "Old Highlight"){
        if(summary_json.filter((word) => {return word.underlined && !word.highlighted && !isPunct(word.word)}).length > 0){
            handleErrorOpen({ msg : "Not all summary span was highlighted." });
            return;
        } 
        SetSummaryUnderline("reset");
        if (allSummaryHighlighted(summary_json, CurrSentInd, isPunct)){
            console.log(`Old state: \"Old Highlight\"; New state: \"Revise All\".`);
            SetStateMachineState("Revise All"); 
            SetInfoMessage("Finished all summary. If needed, please adjust doc spans. In the end, press  \"SUBMIT\".");
        } else if (allSentHighlighted(summary_json, CurrSentInd, isPunct)){
            console.log(`Old state: \"Old Highlight\"; New state: \"Revise Sentence\".`);
            SetStateMachineState("Revise Sentence"); 
            SetInfoMessage("Finished summary sentence. If needed, please adjust doc spans. In the end, press  \"NEXT SENTENCE\".");
        } else {
            console.log(`Old state: \"Old Highlight\"; New state: \"Choose Span\".`);
            SetStateMachineState("Choose Span"); 
            SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
        }
    }
    // "Revise Sentence" state --> "Choose Span" state
    else if (StateMachineState === "Revise Sentence"){
      console.log(`Old state: \"Revise Sentence\"; New state: \"Choose Span\" with SentInd=${CurrSentInd+1}.`);
      SetStateMachineState("Choose Span");
      SetSummaryShadow(CurrSentInd+1);
      SetCurrSentInd(CurrSentInd+1);
      SetInfoMessage("Choose a span and then press \"HIGHLIGHT\".");
    }
    // "Revise All" state --> "Submit" state 
    else if (StateMachineState === "Revise All"){
      console.log(`Old state: \"Revise Sentence\"; New state: \"Submit\"`);
      SetStateMachineState("Submit");
      SetInfoMessage("");
    }
  }

  MachineStateHandler.defaultProps = {
    forceState: '',
  }
  


  export { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler }

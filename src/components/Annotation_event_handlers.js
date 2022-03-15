import { useState, useEffect } from 'react'

const DocMouseClickHandler = ({tkn_id, toggleDocSpanHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked}) => {
    const update_mouse_tkn = DocMouseclicked ? "-1" : tkn_id;
    if (DocMouseclicked){
      const min_ID =  (DocMouseclickStartID > tkn_id) ? tkn_id : DocMouseclickStartID;
      const max_ID =  (DocMouseclickStartID > tkn_id) ? DocMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleDocSpanHighlight(chosen_IDs);     
    }
    SetDocMouseDownStartID(update_mouse_tkn);
    SetDocMouseclicked(!DocMouseclicked);
  }


  const SummaryHighlightHandler = ({summary_json, tkn_id, toggleSummarySpanHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked}) => {  
    const update_mouse_tkn = SummaryMouseclicked ? "-1" : tkn_id;
    if (SummaryMouseclicked){
      const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
      const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleSummarySpanHighlight(chosen_IDs);
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
                                 AlignmentCount, SetAlignmentCount,
                                 approveHighlightHandler,
                                 clickedWordInfo, forceState, 
                                 StartReviseStateHandler, ExitReviseHandler,
                                 ReviseChooseAlignHandler,
                                 isBackBtn,
                                 setPrevSummaryJsonRevise, setPrevDocJsonRevise) => {



    // forceState: "SENTENCE END"
    if (forceState === "SENTENCE END"){
      console.log(`forceState: \"SENTENCE END\"`);
      SetStateMachineState("SENTENCE END");
      SetInfoMessage("Finished sentence highlighting. When ready, press \"APPROVE ALIGNMENT & NEXT SENTENCE\".");
    }

    // forceState: "SUMMARY END"
    else if (forceState === "SUMMARY END"){
      console.log(`forceState: \"SUMMARY END\"`);
      SetStateMachineState("SUMMARY END");
      SetInfoMessage("Finished summary highlighting. When ready, press \"SUBMIT\".");
    }

    // forceState: "ANNOTATION"
    else if (forceState === "ANNOTATION"){
      console.log(`forceState: \"ANNOTATION\"`);
      SetStateMachineState("ANNOTATION");
      SetInfoMessage("Highlight document and summary alignment and then press \"APPROVE ALIGNMENT\".");
    }

    // forceState: "REVISE HOVER"
    else if (forceState === "REVISE HOVER"){
      StartReviseStateHandler(isBackBtn);
      console.log(`forceState: \"REVISE HOVER\"`);
      SetStateMachineState("REVISE HOVER");
      SetInfoMessage("Choose alignment to revise.");
    }

    // forceState: "FINISH REVISION" --> namely go back to state before revision with all-highlighted updated
    else if (forceState === "FINISH REVISION"){
      const prev_state = ExitReviseHandler();
      if (prev_state === "ANNOTATION") {
        SetInfoMessage("Highlight document and summary alignment and then press \"APPROVE ALIGNMENT\".");
      } else if (prev_state === "SENTENCE END"){
        SetInfoMessage("Finished sentence highlighting. When ready, press \"APPROVE ALIGNMENT & NEXT SENTENCE\".");
      } else if (prev_state === "SUMMARY END") {
        SetInfoMessage("Finished summary highlighting. When ready, press \"SUBMIT\".");
      } else{
        alert(`Coming back from Revision to an unsupported state... state is ${prev_state}`);
      }
    }

    // "START" state --> "ANNOTATION" state
    else if (StateMachineState === "START"){
        console.log(`Old state: \"START\"; New state: \"ANNOTATION\" with SentInd=${CurrSentInd+1}.`);
        SetStateMachineState("ANNOTATION");
        SetSummaryShadow(CurrSentInd+1);
        SetCurrSentInd(CurrSentInd+1);
        SetInfoMessage("Highlight document and summary alignment and then press \"APPROVE ALIGNMENT\".");
    }
    
    // "ANNOTATION" state --> "ANNOTATION" with next alignment
    else if (StateMachineState === "ANNOTATION"){
      console.log(`curr AlignmentCount is ${AlignmentCount}`);
      console.log(`Old state: \"ANNOTATION\"; New state: \"ANNOTATION\" with AlignmentCount=${AlignmentCount}.`);
      approveHighlightHandler();
      SetAlignmentCount(AlignmentCount+1);
      SetInfoMessage("Highlight document and summary alignment and then press \"APPROVE ALIGNMENT\".");
    }

    // "SENTENCE END" state --> "ANNOTATION" 
    else if (StateMachineState === "SENTENCE END"){
      // adding last sentence alignment
      console.log(`curr AlignmentCount is ${AlignmentCount}`);
      approveHighlightHandler();
      SetAlignmentCount(AlignmentCount+1);

      // moving to next sentence
      // update of summary sentence shadow is done in App.js in a designated useEffect
      console.log(`Old state: \"SENTENCE END\"; New state: \"ANNOTATION\" with SentInd=${CurrSentInd+1}.`);
      SetStateMachineState("ANNOTATION");
      SetCurrSentInd(CurrSentInd+1);
      SetInfoMessage("Highlight document and summary alignment and then press \"APPROVE ALIGNMENT\".");
    }

      // "SUMMARY END" state --> "SUBMIT" state 
      else if (StateMachineState === "SUMMARY END"){
        console.log(`Old state: \"SUMMARY END\"; New state: \"SUBMIT\"`);
        SetStateMachineState("SUBMIT");
        SetInfoMessage("");
      }

      // "REVISE HOVER" state --> "REVISE CLICKED" state 
      else if (StateMachineState === "REVISE HOVER"){
        console.log(`Old state: \"REVISE HOVER\"; New state: \"REVISE CLICKED\"`);
        ReviseChooseAlignHandler(clickedWordInfo);
        SetStateMachineState("REVISE CLICKED");
        SetInfoMessage("");
      }

      // "REVISE CLICKED" state --> "REVISE HOVER" state 
      else if (StateMachineState === "REVISE CLICKED"){
        console.log(`curr AlignmentCount is ${AlignmentCount}`);
        console.log(`Old state: \"REVISE CLICKED\"; New state: \"REVISE HOVER\"`);
        SetStateMachineState("REVISE HOVER");
        approveHighlightHandler();
        SetAlignmentCount(AlignmentCount+1);
        SetInfoMessage("Choose alignment to revise.");
        setPrevSummaryJsonRevise([]);
        setPrevDocJsonRevise([]);
      }
  }

  MachineStateHandler.defaultProps = {
    forceState: '',
    isBackBtn: false
  }
  


  export { MachineStateHandler, DocMouseClickHandler, SummaryHighlightHandler, SummaryUnderlineHandler }

const MachineStateHandler = (summary_json,
                                 StateMachineState, SetStateMachineState,
                                 SetInfoMessage, handleErrorOpen, isPunct,
                                 CurrSentInd, SetCurrSentInd, SetSummaryShadow,
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
      // SetStateMachineState("SENTENCE END");
      SetInfoMessage("Finished sentence highlighting. When ready, press \"NEXT SENTENCE\".");
    }

    // forceState: "SUMMARY END"
    else if (forceState === "SUMMARY END"){
      console.log(`forceState: \"SUMMARY END\"`);
      // SetStateMachineState("SUMMARY END");
      SetInfoMessage("Finished summary highlighting. When ready, press \"SUBMIT\".");
    }

    // forceState: "ANNOTATION"
    else if (forceState === "ANNOTATION"){
      console.log(`forceState: \"ANNOTATION\"`);
      SetStateMachineState("ANNOTATION");
      SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
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
      if (["ANNOTATION", "SENTENCE START".includes(prev_state)]) {
        SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
      } else if (prev_state === "SENTENCE END"){
        SetInfoMessage("Finished sentence highlighting. When ready, press \"NEXT SENTENCE\".");
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
        SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
    }
    
    // "ANNOTATION" state --> "ANNOTATION" with next alignment
    else if (StateMachineState === "ANNOTATION"){
      console.log(`curr AlignmentCount is ${AlignmentCount}`);
      console.log(`Old state: \"ANNOTATION\"; New state: \"ANNOTATION\" with AlignmentCount=${AlignmentCount}.`);
      approveHighlightHandler();
      SetAlignmentCount(AlignmentCount+1);
      SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
    }

    // "SENTENCE END" state --> "SENTENCE START" 
    else if (StateMachineState === "SENTENCE END"){
      // adding last sentence alignment
      console.log(`curr AlignmentCount is ${AlignmentCount}`);
      approveHighlightHandler();
      SetAlignmentCount(AlignmentCount+1);

      // moving to next sentence
      // update of summary sentence shadow is done in App.js in a designated useEffect
      console.log(`Old state: \"SENTENCE END\"; New state: \"SENTENCE START\" with SentInd=${CurrSentInd+1}.`);
      SetStateMachineState("SENTENCE START");
      SetCurrSentInd(CurrSentInd+1);
      SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
    }
      // "SENTENCE START" state --> "ANNOTATION" with next alignment 
      else if (StateMachineState === "SENTENCE START"){
        console.log(`curr AlignmentCount is ${AlignmentCount}`);
        console.log(`Old state: \"SENTENCE START\"; New state: \"ANNOTATION\" with AlignmentCount=${AlignmentCount}.`);
        SetStateMachineState("ANNOTATION");
        approveHighlightHandler();
        SetAlignmentCount(AlignmentCount+1);
        SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
  
      }
      // "SUMMARY END" state --> "SUBMIT" state 
      else if (StateMachineState === "SUMMARY END"){
        console.log(`Old state: \"SUMMARY END\"; New state: \"SUBMIT\"`);
        // SetStateMachineState("SUBMIT");
        SetInfoMessage("");
      }

      // "REVISE HOVER" state --> "REVISE CLICKED" state 
      else if (StateMachineState === "REVISE HOVER"){
        console.log(`Old state: \"REVISE HOVER\"; New state: \"REVISE CLICKED\"`);
        console.log(`clickedWordInfo:${JSON.stringify(clickedWordInfo)}`)
        ReviseChooseAlignHandler(clickedWordInfo);
        SetStateMachineState("REVISE CLICKED");
        SetInfoMessage("Fix the alignment and press \"UPDATE ALIGNMENT\" to update, or \"BACK\" to discard the changes.");
      }

      // "REVISE CLICKED" state --> "REVISE HOVER" state 
      else if (StateMachineState === "REVISE CLICKED"){
        console.log(`curr AlignmentCount is ${AlignmentCount}`);
        console.log(`Old state: \"REVISE CLICKED\"; New state: \"REVISE HOVER\"`);
        SetStateMachineState("REVISE HOVER");
        SetCurrSentInd(-1)
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



  /************************************************************************************************************************************/


  const g_MachineStateHandler = (summary_json,
    StateMachineState, SetStateMachineState,
    SetInfoMessage, handleErrorOpen, isPunct,
    CurrSentInd, SetCurrSentInd, SetSummaryShadow,
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
// SetStateMachineState("SENTENCE END");
SetInfoMessage("Finished sentence highlighting. When ready, press \"NEXT SENTENCE\".");
}

// forceState: "SUMMARY END"
else if (forceState === "SUMMARY END"){
console.log(`forceState: \"SUMMARY END\"`);
// SetStateMachineState("SUMMARY END");
SetInfoMessage("Finished summary highlighting. When ready, press \"SUBMIT\".");
}

// forceState: "ANNOTATION"
else if (forceState === "ANNOTATION"){
console.log(`forceState: \"ANNOTATION\"`);
SetStateMachineState("ANNOTATION");
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
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
if (["ANNOTATION", "SENTENCE START".includes(prev_state)]) {
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
} else if (prev_state === "SENTENCE END"){
SetInfoMessage("Finished sentence highlighting. When ready, press \"NEXT SENTENCE\".");
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
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");

// g_setStateMachineStateIndex(1.0)
}

// "ANNOTATION" state --> "ANNOTATION" with next alignment
else if (StateMachineState === "ANNOTATION"){
console.log(`curr AlignmentCount is ${AlignmentCount}`);
console.log(`Old state: \"ANNOTATION\"; New state: \"ANNOTATION\" with AlignmentCount=${AlignmentCount}.`);
approveHighlightHandler();
SetAlignmentCount(AlignmentCount+1);
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
}

// "SENTENCE END" state --> "SENTENCE START" 
else if (StateMachineState === "SENTENCE END"){
// adding last sentence alignment
console.log(`curr AlignmentCount is ${AlignmentCount}`);
approveHighlightHandler();
SetAlignmentCount(AlignmentCount+1);

// moving to next sentence
// update of summary sentence shadow is done in App.js in a designated useEffect
console.log(`Old state: \"SENTENCE END\"; New state: \"SENTENCE START\" with SentInd=${CurrSentInd+1}.`);
SetStateMachineState("SENTENCE START");
SetCurrSentInd(CurrSentInd+1);
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");
}
// "SENTENCE START" state --> "ANNOTATION" with next alignment 
else if (StateMachineState === "SENTENCE START"){
console.log(`curr AlignmentCount is ${AlignmentCount}`);
console.log(`Old state: \"SENTENCE START\"; New state: \"ANNOTATION\" with AlignmentCount=${AlignmentCount}.`);
SetStateMachineState("ANNOTATION");
approveHighlightHandler();
SetAlignmentCount(AlignmentCount+1);
SetInfoMessage("Highlight document and summary alignment and then press \"ADD ALIGNMENT\".");

}
// "SUMMARY END" state --> "SUBMIT" state 
else if (StateMachineState === "SUMMARY END"){
console.log(`Old state: \"SUMMARY END\"; New state: \"SUBMIT\"`);
// SetStateMachineState("SUBMIT");
SetInfoMessage("");
}

// "REVISE HOVER" state --> "REVISE CLICKED" state 
else if (StateMachineState === "REVISE HOVER"){
console.log(`Old state: \"REVISE HOVER\"; New state: \"REVISE CLICKED\"`);
ReviseChooseAlignHandler(clickedWordInfo);
SetStateMachineState("REVISE CLICKED");
SetInfoMessage("Fix the alignment and press \"UPDATE ALIGNMENT\" to update, or \"BACK\" to discard the changes.");
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

g_MachineStateHandler.defaultProps = {
forceState: '',
isBackBtn: false
}


  export { MachineStateHandler, g_MachineStateHandler }

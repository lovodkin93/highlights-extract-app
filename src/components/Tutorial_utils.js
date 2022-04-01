import { Markup } from 'interweave';


const resetDocJson = (setDocJson, doc_json, withBold) => {
    if (withBold) {
        setDocJson(doc_json.map((word) => {return {...word, span_highlighted:false }}))
    } else {
        setDocJson(doc_json.map((word) => {return {...word, alignment_id:[], all_highlighted:false, boldfaced:false, old_alignment_hover:false, old_alignments:false, red_color:false, span_alignment_hover:false, span_highlighted:false }}))
    }
}

const resetSummaryJson = (setSummaryJson, summary_json) => {
    setSummaryJson(summary_json.map((word) => {return {...word, alignment_id:[], all_highlighted:false, boldfaced:false, old_alignment_hover:false, old_alignments:false, span_alignment_hover:false, span_highlighted:false }}))
}




const t_StateMachineStateIdHandler = ({IsNext, SetStateMachineState, t_SetStateMachineStateId, t_StateMachineStateId, 
                                        setDocJson, t_start_doc_json, t_middle_doc_json, t_sent_end_doc_json, t_submit_doc_json,
                                        setSummaryJson, t_start_summary_json, t_middle_summary_json, t_sent_end_summary_json, t_submit_summary_json, 
                                        SetCurrSentInd}) => {
    const newStateId = (IsNext) ? t_StateMachineStateId+1 : t_StateMachineStateId-1;
    
    const start_states_end = 10;
    const middle_states_start = start_states_end;
    const middle_states_end = 15;

    if ([0,1].includes(newStateId)) {
        SetStateMachineState("START");
        resetDocJson(setDocJson, t_start_doc_json, false)
        resetSummaryJson(setSummaryJson, t_start_summary_json)
    }

    else if(Array.from(Array(start_states_end).keys()).includes(newStateId)){
        SetCurrSentInd(0)
        if (newStateId===6){
            resetDocJson(setDocJson, t_start_doc_json, true)
            resetSummaryJson(setSummaryJson, t_start_summary_json)
        } else if ([7,8,9].includes(newStateId) ) {
            resetDocJson(setDocJson, t_start_doc_json, true)
            setSummaryJson(t_start_summary_json)
        } else {
            setDocJson(t_start_doc_json)
            setSummaryJson(t_start_summary_json)
        }
        SetStateMachineState("ANNOTATION");
    } else if([...Array(middle_states_end - middle_states_start + 1).keys()].map(x => x + middle_states_start).includes(newStateId)){
        SetCurrSentInd(1)
        setDocJson(t_middle_doc_json)
        setSummaryJson(t_middle_summary_json)
        SetStateMachineState("ANNOTATION");
        // alert(`now middle: ${newStateId}`)
    }


    t_SetStateMachineStateId(newStateId)
    // setDocJson(start_doc_json)
    // setSummaryJson(start_summary_json)
  }
  
  const getTutorialCardTitle = (t_state_messages,t_StateMachineStateId) => {
    return t_state_messages.filter((t_state) => {return t_state.state_cnt === t_StateMachineStateId})[0].title
  }
  
  const getTutorialCardText = (t_state_messages, t_StateMachineStateId) => {
      if (t_StateMachineStateId===0){
          return intro_message();
      } else {
          return (
              <div className="tutorial-text">
                  <Markup content={t_state_messages.filter((t_state) => {return t_state.state_cnt === t_StateMachineStateId})[0].message} />
              </div>
          )
      }
  }
  
  
  const intro_message = () => {
    return (
        <div className="tutorial-text">
            In this task, you are presented with a document and its summary. 
            <br/>
            The summary was written by an expert summarizer who first highlighted important spans in the document and then merged then into a coherent pagaraph. 
            <br/>
            <b>Your goal</b> is to locate all those document spans, and align them to the summary spans they have contributed to.
            <hr/>
            This tutorial will walk you through the different elements of the UI, which are aimed to ease the search process, whereas the Guided Annotation option should help
            you understand the correct way to perform this work. 
            <br/>
            <b>It is crucial</b> to complete both sections before starting to annotate.
            {/* <hr/>
            If you have already did this tutorial and want to check a specific section, you can use the following table of contents: */}

        </div>
    )}





  export { t_StateMachineStateIdHandler, getTutorialCardTitle, getTutorialCardText, intro_message }

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




const t_StateMachineStateIdHandler = ({newStateId, SetStateMachineState, t_SetStateMachineStateId, t_StateMachineStateId, 
                                        setDocJson, t_start_doc_json, t_middle_doc_json, t_sent_end_doc_json, t_submit_doc_json,
                                        setSummaryJson, t_start_summary_json, t_middle_summary_json, t_sent_end_summary_json, t_submit_summary_json, 
                                        SetCurrSentInd,
                                        MachineStateHandlerWrapper}) => {
    const start_states_end = 10;
    const middle_states_start = start_states_end;
    const middle_states_end = 11;

    if (newStateId===1) {
        SetStateMachineState("START");
        resetDocJson(setDocJson, t_start_doc_json, false)
        resetSummaryJson(setSummaryJson, t_start_summary_json)
        SetCurrSentInd(-1)
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
        if ([11,11].includes(newStateId)) {
            SetStateMachineState("REVISE HOVER");
            SetCurrSentInd(-1)
            setDocJson(t_middle_doc_json.map((word) => {return {...word, span_highlighted: false}}))
            setSummaryJson(t_middle_summary_json.map((word) => {return {...word, span_highlighted: false}}))
        } else {
            SetCurrSentInd(1);
            setDocJson(t_middle_doc_json);
            setSummaryJson(t_middle_summary_json);
            SetStateMachineState("ANNOTATION");
        }
    } else if (newStateId===11) {
        SetCurrSentInd(1);
        setDocJson(t_sent_end_doc_json);
        setSummaryJson(t_sent_end_summary_json);
        SetStateMachineState("SENTENCE END");
    } else if (newStateId===11) {
        SetCurrSentInd(2);
        setDocJson(t_submit_doc_json);
        setSummaryJson(t_submit_summary_json);
        SetStateMachineState("SUMMARY END");
    } else if (newStateId===12) {
        SetCurrSentInd(0);
        resetDocJson(setDocJson, t_start_doc_json, true)
        setSummaryJson(t_start_summary_json)
        SetStateMachineState("ANNOTATION");
    }


    t_SetStateMachineStateId(newStateId)
    // setDocJson(start_doc_json)
    // setSummaryJson(start_summary_json)
  }
  
  const getTutorialCardTitle = (t_state_messages,t_StateMachineStateId) => {
    return t_state_messages.filter((t_state) => {return t_state.state_cnt === t_StateMachineStateId})[0].title
  }
  
  const getTutorialCardText = (t_state_messages, t_StateMachineStateId) => {
    //   console.log("t_state_messages:")
    //   console.log(t_state_messages)
      if (t_StateMachineStateId===0){
          return intro_message();
      } else if (t_StateMachineStateId===15){
        return basic_instructions();
      }else {
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
            Welcome to the Highlight Extraction UI.
            <br/>
            In this task, you are presented with a document and its summary. 
            <br/>
            The summary was written by an expert summarizer who first highlighted important spans in the document and then merged them into a coherent pagaraph. 
            <br/>
            <b>Your goal</b> is to locate all those document spans, and align them to their summary counterparts.
            <hr/>
            <u>This tutorial</u> will walk you through the different elements of the UI, which are aimed to ease the search process, whereas the <u>Guided Annotation</u> section should help
            you understand the correct way to perform this task. 
            <br/>
            <b>It is crucial</b> to complete both sections before starting to annotate.
            {/* <hr/>
            If you have already did this tutorial and want to check a specific section, you can use the following table of contents: */}

        </div>
    )}


    const basic_instructions = () => {
        return (
            <div className="tutorial-text">
                When a summary sentence is very long, we strongly suggest to break it down into smaller pieces, and align each of them separately.
                This is to prevent you from missing out small details.
                <br/>
                For example, the sentence:
                    <h4>
                        Sixty Forest Service firefighters brought Michigan's four-day Hiawatha
                        <br></br> 
                        National Forest fire under control after it burned 1100 acres of woodlands.
                    </h4>
                should be broken down either into:
                <ol>
                    <li>Sixty Forest Service firefighters brought Michigan's four-day Hiawatha National Forest fire under control</li>
                    <li>fire under control after it burned 1100 acres of woodlands.</li>
                </ol>

                or into:

                <ol>
                    <li>Sixty Forest Service firefighters brought ... fire under control</li>
                    <li>Michigan's four-day Hiawatha National Forest fire</li>
                    <li>fire under control after it burned 1100 acres of woodlands.</li>
                </ol>
                This way, there is less risk of missing out small details.
                <br/>
                On the other hand, avoid working on spans that are too general or that don't cover complete events.
                <br/>
                Following the example above, working with spans like "Sixty Forest Service firefighters" or "1100 acres of woodlands" is too general, as those spans can appear in the document out of their summary's context.
                <br/>
                Alternatively, working with spans like "Sixty Forest Service firefighters brought" or "fire under control after it" is also problematic as it doesn't cover full events.
                A few general rules of thumb for choosing a summary span to align are:
                    <ul>
                        <li>Is the information presented in the span missing something? Or is it self-informative?</li>
                        <li>Can I imagine the information described in the span? Or do I feel like I need some extra information?</li>
                        <li>Is the information presented in the span specific? Or is it too general?</li>
                        <li>Do I feel like there are too many pieces of information in the span? If so, is there a way to leave some of it out while keeping the span self-informative?</li>
                    </ul>
                <b><u>Note</u>: The task is over only when you align all the summary (in other words, when all the summary is highlighted).</b>
                <hr/>
                <b>Lastly, make sure that what you highlight in the document covers all the information in the summary and only it!</b>
    
            </div>
        )}

    // const tutorial_table_of_contents = () => {
    //     return 
    // }





  export { t_StateMachineStateIdHandler, getTutorialCardTitle, getTutorialCardText, intro_message }

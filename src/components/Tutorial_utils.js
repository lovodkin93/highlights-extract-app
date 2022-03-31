


const t_StateMachineStateIdHandler = ({IsNext, t_SetStateMachineStateId,t_StateMachineStateId,setDocJson,origin_doc_json,setSummaryJson,origin_summary_json}) => {
    const newStateId = (IsNext) ? t_StateMachineStateId+1 : t_StateMachineStateId-1;
    
    t_SetStateMachineStateId(newStateId)
    setDocJson(origin_doc_json)
    setSummaryJson(origin_summary_json)
  }
  
  const getTutorialCardTitle = (t_state_messages,t_StateMachineStateId) => {
    return t_state_messages.filter((t_state) => {return t_state.state_cnt === t_StateMachineStateId})[0].title
  }
  
  const getTutorialCardText = (t_state_messages, t_StateMachineStateId) => {
      if (t_StateMachineStateId===0){
          return intro_message();
      } else {
          return (
              <div>
                  {t_state_messages.filter((t_state) => {return t_state.state_cnt === t_StateMachineStateId})[0].message}
              </div>
          )
      }
  }
  
  
  const intro_message = () => {
    return (<div>
              In this task, you are presented with a document and its summary. 
              <br></br>
              The summary was constructed by an expert summarizer who first highlighted important information in the document and then merged it in a coherent manner. 
              <br></br>
              Your goal is to locate those spans the summarizer highlighted.
    </div>)
  }





  export { t_StateMachineStateIdHandler, getTutorialCardTitle, getTutorialCardText, intro_message }

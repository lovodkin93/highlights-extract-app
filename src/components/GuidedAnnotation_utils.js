import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastHeader from 'react-bootstrap/ToastHeader'
import ToastBody from 'react-bootstrap/ToastBody'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Carousel from 'react-bootstrap/Carousel'


const add_text_to_GuidedAnnotationInfoAlert = (g_is_good_alignment,StateMachineState, doc_json) => {
    const NoAlign = (doc_json.filter((word) => {return word.span_highlighted}).length===0) ? "(NO ALIGN)":""
    if(g_is_good_alignment) {
      if(StateMachineState==="ANNOTATION"){return `<br/><b>Hit \"CONFIRM ${NoAlign}\" to proceed.</b>`}
      if(StateMachineState==="SENTENCE END"){return `<br/><b>Hit \"NEXT SENTENCE ${NoAlign}\" to proceed.</b>`}
      if(StateMachineState==="SUMMARY END"){return `<br/><b>Hit \"SUBMIT ${NoAlign}\" to finish.</b>`}
    } 
    // else {
    //   if(StateMachineState==="SENTENCE END"){return "<br/>When you are finished, <b>hit \"NEXT SENTENCE ${NoAlign}\"</b> to confirm and proceed to the next sentence."}
    //   if(StateMachineState==="SUMMARY END"){return "<br/>When you are finished, <b>hit \"SUBMIT ${NoAlign}\"</b> to confirm and finish."}
    // }
    return ""
  }


  const string_to_span = (span_str) => {
    const sub_strings = span_str.split(";");
    const lims = sub_strings.map((sub_string) => sub_string.split("-").map((lim) => parseInt(lim)))
    // console.log(`lims:${JSON.stringify(span_str)}`)
    const ids = lims.map(([start, end]) => Array(end - start + 1).fill().map((_, idx) => start + idx)).flat(1)
    return ids.sort(function(a, b) {return a - b;})
  }

  export { add_text_to_GuidedAnnotationInfoAlert, string_to_span }



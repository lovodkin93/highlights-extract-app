import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastHeader from 'react-bootstrap/ToastHeader'
import ToastBody from 'react-bootstrap/ToastBody'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Carousel from 'react-bootstrap/Carousel'


const add_text_to_GuidedAnnotationInfoAlert = (g_is_good_alignment,StateMachineState, doc_json) => {
    console.log(`doc_json:${JSON.stringify(doc_json)}`)
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




  const get_span_groups = (g_answer_words_to_glow, words_json, isSummary) => {
    const str_spans = g_answer_words_to_glow["ids"].split(";")
    let non_glow_min_lim = (isSummary) ? g_answer_words_to_glow["start_tkn"].toString() : "0";
    let span_groups = []
    for (let i = 0; i < str_spans.length; i++) {
      const lims = str_spans[i].split("-")
      let non_glow_max_lim = parseInt(lims[0]) - 1;
      non_glow_max_lim = non_glow_max_lim.toString()
      // start with an empty array because the glowing words are the odd spans (1,3,5,7... rather than 0,2,4...)
      if (lims[0]===non_glow_min_lim){
        span_groups=span_groups.concat([[]])
      } else {
        span_groups=span_groups.concat([string_to_span(`${non_glow_min_lim}-${non_glow_max_lim}`)])
      }
      span_groups=span_groups.concat([string_to_span(str_spans[i])])
      non_glow_min_lim = parseInt(lims[1]) + 1
      non_glow_min_lim = non_glow_min_lim.toString()
    }
    // final span
    let non_glow_max_lim = (isSummary) ?  words_json.length + g_answer_words_to_glow["start_tkn"] : words_json.length
    non_glow_max_lim = non_glow_max_lim.toString()
    console.log(`span_groups:${JSON.stringify(span_groups)}`)
    console.log(`non_glow_min_lim:${non_glow_min_lim} and non_glow_max_lim:${non_glow_max_lim}`)
    span_groups=span_groups.concat([string_to_span(`${non_glow_min_lim}-${non_glow_max_lim}`)])
    console.log("span_groups:")
    console.log(span_groups)

    const doc_words_groups = span_groups.map((tkns) => {return words_json.filter((word) => {return tkns.includes(word.tkn_id)})})
    return doc_words_groups
  }

  export { add_text_to_GuidedAnnotationInfoAlert, string_to_span, get_span_groups }



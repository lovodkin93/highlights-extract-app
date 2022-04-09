import { MachineStateHandler, g_MachineStateHandler } from './Annotation_event_handlers';
import { useState, useEffect, useRef } from 'react'
import Annotation from './Annotation';
import Alert from 'react-bootstrap/Alert'
import Fade from 'react-bootstrap/Fade'
import { Markup } from 'interweave';

const GuidedAnnotation = ({isPunct,
                          handleErrorOpen, handleErrorClose,
                          doc_json, setDocJson,
                          summary_json, setSummaryJson,
                          all_lemma_match_mtx, setAllLemmaMtx,
                          important_lemma_match_mtx, setImportantLemmaMtx,
                          doc_paragraph_breaks, setDocParagraphBreaks,
                          boldState, setBoldState,
                          oldAlignmentState, setOldAlignmentState,
                          StateMachineState, SetStateMachineState,
                          error_message, setErrorMessage,
                          CurrSentInd, SetCurrSentInd,
                          InfoMessage, SetInfoMessage,
                          AlignmentCount, SetAlignmentCount,
                          prevStateMachineState, setPrevStateMachineState,
                          prevSummarySpanHighlights, setPrevSummarySpanHighlights,
                          prevDocSpanHighlights, setPrevDocSpanHighlights,
                          prevSummaryJsonRevise, setPrevSummaryJsonRevise,
                          prevDocJsonRevise, setPrevDocJsonRevise,
                          DocOnMouseDownID, SetDocOnMouseDownID,
                          SummaryOnMouseDownID, SetSummaryOnMouseDownID,
                          docOnMouseDownActivated, setDocOnMouseDownActivated,
                          summaryOnMouseDownActivated, setSummaryOnMouseDownActivated,
                          hoverActivatedId, setHoverActivatedId,
                          hoverActivatedDocOrSummary, setHoverActivatedDocOrSummary,
                          sliderBoldStateActivated, setSliderBoldStateActivated,
                          guided_annotation_messages, guided_annotation_info_messages,
                          guiding_msg, setGuidingMsg,
                          guiding_msg_type, setGuidingMsgType,
                          curr_alignment_guiding_msg_id, setCurrAlignmentGuidingMsgId,
                          guiding_info_msg, setGuidingInfoMsg,
                          is_good_alignment, setIsGoodAlignment
                        }) => {

    
    const toggleDocSpanHighlight = ({tkn_ids, turn_on, turn_off}) => {

      const isSummarySpanOkDict = isSummarySpanOk([], false, false)
      
      if(!isSummarySpanOkDict["summary_span_ok"]) {
        if (isSummarySpanOkDict["chosen_span_id"]===undefined){
          setGuidingMsg(guided_annotation_messages["default_too_short_summary_msg"])
          setGuidingMsgType("danger")
        } else {
          let gold_tkns = guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_spans"][isSummarySpanOkDict["chosen_span_id"]]
          gold_tkns = gold_tkns.map((span) => {return string_to_span(span)})
          update_error_message(gold_tkns, isSummarySpanOkDict["highlighted_tkn_ids"], isSummarySpanOkDict["chosen_span_id"], false)
        }
        return
      }

      const isAlignmentOkDict = isAlignmentOk(tkn_ids, turn_on, turn_off);
      if (isAlignmentOkDict["alignment_ok"]) {
        if (Object.keys(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id]).includes("text")) {
          setGuidingMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id])
          setGuidingInfoMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id])
        } else {
          setGuidingMsg(guided_annotation_messages["default_good_alignment_msg"])
          setGuidingInfoMsg(guided_annotation_messages["default_good_alignment_msg"])
        }
        setGuidingMsgType("success");
        // setIsGoodAlignment(true);
      }
      else {
        // updating the info message
        if (Object.keys(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][curr_alignment_guiding_msg_id]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][curr_alignment_guiding_msg_id])
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_find_alignment"])
        }
      } 







      setSliderBoldStateActivated(false)
      if (turn_on){
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word))
      } else if (turn_off){
          setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false } : word))
      } else {
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word))
      }
    }
  
    toggleDocSpanHighlight.defaultProps = {
      turn_on: false,
      turn_off: false
    }
  
  
    
  
    const toggleSummarySpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
      const isSummarySpanOkDict = isSummarySpanOk(tkn_ids, turn_on, turn_off)
      if(isSummarySpanOkDict["summary_span_ok"]) {
        console.log("I am ok")
        console.log("isSummarySpanOkDict:")
        console.log(isSummarySpanOkDict)
        // updating the success alert
        if (Object.keys(guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_span_msg"][isSummarySpanOkDict["chosen_span_id"]]).includes("text")) {
          setGuidingMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_span_msg"][isSummarySpanOkDict["chosen_span_id"]])
        } else {
          setGuidingMsg(guided_annotation_messages["default_good_summary_span_msg"]) 
        }
        setGuidingMsgType("success")
        setCurrAlignmentGuidingMsgId(isSummarySpanOkDict["chosen_span_id"])


        // updating the info message
        if (Object.keys(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][isSummarySpanOkDict["chosen_span_id"]]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][isSummarySpanOkDict["chosen_span_id"]])
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_find_alignment"])
        }
      } 
      else {
        console.log("I am not ok")
        console.log("isSummarySpanOkDict:")
        console.log(isSummarySpanOkDict)
        // updating the info message
        const guiding_info_sent_id = (["START", "SENTENCE END"].includes(StateMachineState)) ? CurrSentInd+1 : CurrSentInd
        if (Object.keys(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"])
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_choose_summary_span"])
        }

        // if the span/alignment were good - updating it.
        setIsGoodAlignment(false)
        setCurrAlignmentGuidingMsgId("-1")
      }


      setSliderBoldStateActivated(false)
      if (turn_on){
        setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word));
      } else if (turn_off){
        setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false } : word));
      } else {
        setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word));
      }
    }
  
    toggleSummarySpanHighlight.defaultProps = {
      turn_on: false,
      turn_off: false
    }
  
    const approveHighlightHandler = () => {
      const doc_tkn_ids = doc_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
      setDocJson(doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? { ...word, all_highlighted: true, alignment_id: [...word.alignment_id, AlignmentCount], span_highlighted: false } : word));
  
  
      const summary_tkn_ids = summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
      setSummaryJson(summary_json.map((word) => summary_tkn_ids.includes(word.tkn_id) ? { ...word, all_highlighted: true, alignment_id: [...word.alignment_id, AlignmentCount], span_highlighted: false } : word));    
   
    }
  
    const StartReviseStateHandler = (isBackBtn) => {
      if (isBackBtn){
        setDocJson(doc_json.map((word, ind) => {return {...word, all_highlighted: prevDocJsonRevise[ind].all_highlighted, span_highlighted: prevDocJsonRevise[ind].span_highlighted, alignment_id: prevDocJsonRevise[ind].alignment_id}}))
        setSummaryJson(summary_json.map((word, ind) => {return {...word, all_highlighted: prevSummaryJsonRevise[ind].all_highlighted, span_highlighted: prevSummaryJsonRevise[ind].span_highlighted, alignment_id: prevSummaryJsonRevise[ind].alignment_id}}))
      } else{
        setPrevStateMachineState(StateMachineState);
        setPrevDocSpanHighlights(doc_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
        setPrevSummarySpanHighlights(summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
        
        setDocJson(doc_json.map((word) => {return {...word, span_highlighted: false}}))
        setSummaryJson(summary_json.map((word) => {return {...word, span_highlighted: false}}))
      }
    }
  
    const ExitReviseHandler = () => {
      setDocJson(doc_json.map((word, ind) => prevDocSpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))
      setSummaryJson(summary_json.map((word, ind) => prevSummarySpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))               
      const prev_state = prevStateMachineState;
      SetStateMachineState(prevStateMachineState);
      setPrevStateMachineState("");
      setPrevSummarySpanHighlights([]);
      setPrevDocSpanHighlights([]);
      return prev_state
    }
  
    const RemoveAlignmentId = (word, chosen_align_id) => {
      const new_alignment_id = word.alignment_id.filter((elem) => {return elem !== chosen_align_id});
      return new_alignment_id;
    }
  
    const ReviseChooseAlignHandler = (clickedWordInfo) => {
      setPrevSummaryJsonRevise(summary_json);
      setPrevDocJsonRevise(doc_json);
  
      const chosen_align_id = (clickedWordInfo[0] === 'doc') ? doc_json.filter((word) => {return word.tkn_id === clickedWordInfo[1]})[0].alignment_id[0] : 
      summary_json.filter((word) => {return word.tkn_id === clickedWordInfo[1]})[0].alignment_id[0]
  
      setSummaryJson(summary_json.map((word) => word.alignment_id.includes(chosen_align_id) ? {...word, span_highlighted: true, all_highlighted: false, old_alignments: false, old_alignment_hover:false, alignment_id: RemoveAlignmentId(word, chosen_align_id)} : {...word, span_highlighted: false}))
      setDocJson(doc_json.map((word) => word.alignment_id.includes(chosen_align_id) ? {...word, span_highlighted: true, all_highlighted: false, old_alignments: false, old_alignment_hover:false, alignment_id: RemoveAlignmentId(word, chosen_align_id)} : {...word, span_highlighted: false}))
    }
  
  
    const SetSummaryShadow = (sent_id) => {
      setSummaryJson(summary_json.map((word) => word.sent_id === sent_id ? { ...word, shadowed: true } : { ...word, shadowed: false }))
    }
  
  
    const SetSummaryShadowAndUpdateHighlights = (sent_id) => {
      setSummaryJson(
        summary_json.map((word) => word.sent_id === sent_id ? { ...word, shadowed: true } : { ...word, shadowed: false }).map(
        (word) => word.span_highlighted ? {...word, span_highlighted: false, all_highlighted:true} : word)
        )
    }
  
    const SetDocBoldface = (tkn_ids) => {
      setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, boldfaced: true } : { ...word, boldfaced: false }))
    }
  
  
  
  
    const checkIfLemmasMatch = ({doc_id, summary_ids, isHover}) => {
      const which_match_mtx = important_lemma_match_mtx;
      const matching_summary_ids = summary_ids.filter((summary_id) => {return all_lemma_match_mtx[doc_id][summary_id] === 1;})
      return matching_summary_ids.length > 0
    }
  
    const boldStateHandler = (event, newValue) => {
      if (event !== undefined){
        setSliderBoldStateActivated(true)
      }
      if (newValue=='1'){
        setBoldState("none");
        SetDocBoldface([]);
      } else if (newValue=='2'){
        setBoldState("span");
        const summary_ids = summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
        const isSpan = true;
        const tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id:doc_id, summary_ids:summary_ids, isHover:false})});
        SetDocBoldface(tkn_ids);
      } else {
        setBoldState("sent");
        const isSpan = false;
        const summary_ids = summary_json.filter((word) => {return word.shadowed}).map((word) => {return word.tkn_id});
        const tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id:doc_id, summary_ids:summary_ids, isHover:false})});
        SetDocBoldface(tkn_ids);
      }
    }
  
  
    const SetDocOldHighlights = (tkn_ids) => {
      setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
    }
  
    const SetSummaryOldHighlights = (tkn_ids) => {
      setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
    }
  
    const FindDocAlignmentPerSent = (sent_ind) => {
      let curr_sent_alignment_ids = summary_json.map((word) => {return (word.sent_id===sent_ind) ? word.alignment_id : []});
      curr_sent_alignment_ids = [].concat.apply([], curr_sent_alignment_ids); // merge into a single array (before was an array of arrays)
      const doc_ids = doc_json.filter((word) => {return word.alignment_id.some(r=> curr_sent_alignment_ids.includes(r))}).map((word) => {return word.tkn_id});
      return doc_ids
    }
  
  
    const oldAlignmentStateHandler = ({event, newValue, sent_ind}) => {
  
      if (newValue=='1'){
        setOldAlignmentState("none");
        SetDocOldHighlights([]);
        SetSummaryOldHighlights([]);
      } else if (newValue=='2'){
        setOldAlignmentState("sent");
        sent_ind = (sent_ind===-1) ? CurrSentInd : sent_ind
        const doc_ids = FindDocAlignmentPerSent(sent_ind)
        const summary_ids = summary_json.filter((word) => {return (word.all_highlighted && word.sent_id === sent_ind)}).map((word) => {return word.tkn_id});
        SetDocOldHighlights(doc_ids);
        SetSummaryOldHighlights(summary_ids);
      } else {
        setOldAlignmentState("all");
        const doc_ids = doc_json.filter((word) => {return word.all_highlighted}).map((word) => {return word.tkn_id});
        const summary_ids = summary_json.filter((word) => {return word.all_highlighted}).map((word) => {return word.tkn_id});
        SetDocOldHighlights(doc_ids);
        SetSummaryOldHighlights(summary_ids);
      }
    }
  
    oldAlignmentStateHandler.defaultProps = {
      sent_ind: -1
    }
  
  
  
    const hoverHandler = ({inOrOut, curr_alignment_id, tkn_id, isSummary}) => {
      // onMouseEnter for "REVISE HOVER"
      if (inOrOut === "in" && StateMachineState==="REVISE HOVER") { 
        setDocJson(doc_json.map((word) => word.alignment_id.includes(curr_alignment_id) ? {...word, old_alignment_hover: true} : {...word, old_alignment_hover: false}))
        setSummaryJson(summary_json.map((word) => word.alignment_id.includes(curr_alignment_id) ? {...word, old_alignment_hover: true} : {...word, old_alignment_hover: false}))
      } 
      // onMouseLeave for "REVISE HOVER"
      else if (inOrOut === "out" && StateMachineState==="REVISE HOVER") { 
        setDocJson(doc_json.map((word) => {return {...word, old_alignment_hover:false}}))
        setSummaryJson(summary_json.map((word) => {return {...word, old_alignment_hover:false}}))
      }
      // onMouseLeave for all the alignments choosing states
      else if (inOrOut === "out" && ["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState) && isSummary) { 
        setDocJson(doc_json.map((word) => {return {...word, red_color:false}}))
      }
  
    }
  
    const isRedLettered = (summary_tkn_id) => {
      if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id > CurrSentInd}).length !== 0)){
        return false
      } else if ((summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))) {
        return false
      } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
        return true
      }
  
    }
  
  
  
    const MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
      // check if alignment is good
      if (forceState === undefined && StateMachineState!=="START") { 
        const isAlignmentOkDict = isAlignmentOk();
        if (isAlignmentOkDict["alignment_ok"]) {
          // setGuidingMsg(guided_annotation_messages["default_good_alignment_msg"]) // AVIVSL: add custom success messages
          // setGuidingMsgType("success");
          setCurrAlignmentGuidingMsgId("-1");
        } else {
          update_error_message(isAlignmentOkDict["gold_align_tkns"], isAlignmentOkDict["highlighted_doc_tkns"], curr_alignment_guiding_msg_id, true);
          return
        }
      }

      // check if span is ok (for the case when the summary span was changed after the alignment was approved)
      if (forceState === undefined && StateMachineState!=="START") { 
        const isSummarySpanOkDict = isSummarySpanOk([], false, false)
      
        if(!isSummarySpanOkDict["summary_span_ok"]) {
          setGuidingMsg({"text":"Summary highlighting was changed and is not aligned to the document highlighting anymore.", "title":"Summary highlighting changed and is not good"})
          setGuidingMsgType("danger")
          return
        }



      }






      // info messages(alerts)
      if (forceState===undefined) {
        const guiding_info_sent_id = (["START", "SENTENCE END"].includes(StateMachineState)) ? CurrSentInd+1 : CurrSentInd
        if (Object.keys(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"])
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_choose_summary_span"])
        }
      }
      //returning to alignment not being ok (because no alignment)
      setIsGoodAlignment(false)

      // updating the state (if there is no alignment error)
      setSliderBoldStateActivated(false);
      MachineStateHandler(summary_json,
                            StateMachineState, SetStateMachineState,
                            SetInfoMessage, handleErrorOpen, isPunct,
                            CurrSentInd, SetCurrSentInd, SetSummaryShadow,
                            AlignmentCount, SetAlignmentCount,
                            approveHighlightHandler,
                            clickedWordInfo, forceState, 
                            StartReviseStateHandler, ExitReviseHandler,
                            ReviseChooseAlignHandler, 
                            isBackBtn,
                            setPrevSummaryJsonRevise, setPrevDocJsonRevise,
                           );
    }
  
    MachineStateHandlerWrapper.defaultProps = {
      forceState: '',
      clickedWordInfo: [],
      isBackBtn: false
    }






    /**************************** GUIDING-RELATED FUNCTIONS ******************************/

    const string_to_span = (span_str) => {
      const sub_strings = span_str.split(";");
      const lims = sub_strings.map((sub_string) => sub_string.split("-").map((lim) => parseInt(lim)))
      // console.log(`lims:${JSON.stringify(span_str)}`)
      const ids = lims.map(([start, end]) => Array(end - start + 1).fill().map((_, idx) => start + idx)).flat(1)
      return ids.sort(function(a, b) {return a - b;})
    }

    const intersection = (arr1, arr2) => {
      return arr1.filter((elem) => {return arr2.includes(elem)})
    }


    const isSummarySpanOk = (tkn_ids, turn_on, turn_off) => {

      const gold_mentions = guided_annotation_messages["goldMentions"][CurrSentInd]

      let highlighted_tkn_ids = summary_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id)
      highlighted_tkn_ids = (turn_on) ? highlighted_tkn_ids.concat(tkn_ids) : highlighted_tkn_ids
      highlighted_tkn_ids = (turn_off) ? highlighted_tkn_ids.filter((tkn) => {return (turn_off && !tkn_ids.includes(tkn))}) : highlighted_tkn_ids
      highlighted_tkn_ids = [...new Set(highlighted_tkn_ids)] // remove duplicates
      highlighted_tkn_ids = highlighted_tkn_ids.filter((tkn_id) => {return !isPunct(summary_json.filter((word) => {return word.tkn_id===tkn_id})[0].word)}) // ignore punctuation  
      highlighted_tkn_ids = highlighted_tkn_ids.sort(function(a, b) {return a - b;}) // order    
      let chosen_span_id = Object.keys(gold_mentions["span_indicating_tkns"]).filter((key) => {return gold_mentions["span_indicating_tkns"][key].some((span) => hasSubArray(highlighted_tkn_ids, string_to_span(span)))})

      console.log(`chosen_span_id:${JSON.stringify(chosen_span_id)}`)
      console.log(`highlighted_tkn_ids:${JSON.stringify(highlighted_tkn_ids)}`)
      if (chosen_span_id.length===0){
        return {"summary_span_ok":false, "chosen_span_id":undefined, "highlighted_tkn_ids":highlighted_tkn_ids}
      } else {
        chosen_span_id = chosen_span_id[0]
      }

      const good_summary_spans = Object.keys(gold_mentions["good_summary_spans"][chosen_span_id]).map((key) => {return string_to_span(gold_mentions["good_summary_spans"][chosen_span_id][key])})
      const str_good_summary_spans = good_summary_spans.map((span) => JSON.stringify(span.sort(function(a, b) {return a - b;})))

      if (str_good_summary_spans.includes(JSON.stringify(highlighted_tkn_ids.sort(function(a, b) {return a - b;})))) {
        return {"summary_span_ok":true, "chosen_span_id":chosen_span_id, "highlighted_tkn_ids":highlighted_tkn_ids}
      } else {
        return {"summary_span_ok":false, "chosen_span_id":chosen_span_id, "highlighted_tkn_ids":highlighted_tkn_ids}
      }
    }

    const update_error_message = (gold_tkns, actual_tkns, chosen_span_id, isAlignError) => {
      let actual_tkns_no_punct;
      if (isAlignError) {
        actual_tkns_no_punct = actual_tkns.filter((tkn) => {return !isPunct(doc_json.filter((word) => {return word.tkn_id===tkn})[0].word)})
      } else {
        actual_tkns_no_punct = actual_tkns.filter((tkn) => {return !isPunct(summary_json.filter((word) => {return word.tkn_id===tkn})[0].word)})
      }
      if (actual_tkns_no_punct.filter((tkn) => {return gold_tkns.filter((span) => {return span.includes(tkn)}).length === 0}).length !== 0) {
        update_excess_message(gold_tkns, actual_tkns_no_punct, chosen_span_id, isAlignError)
      } else {
        update_missing_message(gold_tkns, actual_tkns_no_punct, chosen_span_id, isAlignError)
      }
    }

    const hasSubArray = (master, sub) => {
      return sub.every((i => v => i = master.indexOf(v, i) + 1)(0));
    }

    const update_excess_message = (gold_tkns, actual_tkns, chosen_span_id, isAlignError) => {
      const msg_type_key = (isAlignError) ? "redundant_alignment_msg" : "too_long_summary_msgs" 
      const default_msg_key = (isAlignError) ? "default_redundant_alignment_msg" : "default_too_long_summary_msg" 
      
      const guiding_msgs = guided_annotation_messages["goldMentions"][CurrSentInd][msg_type_key][chosen_span_id]
      const excess_tkns = actual_tkns.filter((tkn) => {return gold_tkns.every((span) => {return !span.includes(tkn)})}).sort(function(a, b) {return a - b;})
      

      if (guiding_msgs.length===0){
        setGuidingMsg(guided_annotation_messages[default_msg_key])
        setGuidingMsgType("danger")
        return
      }
      
      
      
      const custom_message_json = guiding_msgs.filter((json_obj) => {return json_obj["excess_tkns"].some((span) => {return intersection(excess_tkns, string_to_span(span)).length !==0 })})
      
      if(custom_message_json.length !== 0) {
        setGuidingMsg(custom_message_json[0])
        setGuidingMsgType("danger")
      } else {
        setGuidingMsg(guided_annotation_messages[default_msg_key])
        setGuidingMsgType("danger")
      }
    }

    const update_missing_message = (gold_tkns, actual_tkns, chosen_span_id, isAlignError) => {

      const msg_type_key = (isAlignError) ? "missing_alignment_msg" : "too_short_summary_msgs" 
      const default_msg_key = (isAlignError) ? "default_missing_alignment_msg" : "default_too_short_summary_msg" 

      const guiding_msgs = guided_annotation_messages["goldMentions"][CurrSentInd][msg_type_key][chosen_span_id]
      const merged_gold_tkns = [...new Set(gold_tkns.flat(1))].sort(function(a, b) {return a - b;})
      const missing_tkns = merged_gold_tkns.filter((tkn) => {return !actual_tkns.includes(tkn)})
      const custom_message_json = guiding_msgs.filter((json_obj) => {return json_obj["missing_tkns"].some((span) => {return intersection(missing_tkns, string_to_span(span)).length !== 0 })})

      if(custom_message_json.length !== 0) {
        setGuidingMsg(custom_message_json[0])
        setGuidingMsgType("danger")
      } else {
        setGuidingMsg(guided_annotation_messages[default_msg_key])
        setGuidingMsgType("danger")
      }
    }


    const isAlignmentOk = (tkn_ids, turn_on, turn_off) => {
      // const doc_tkns = doc_json.filter((word) => {return word.span_highlighted && !isPunct(word.word)}).map((word) => word.tkn_id).sort(function(a, b) {return a - b;})
      
      let doc_tkns = doc_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id)
      doc_tkns = (turn_on) ? doc_tkns.concat(tkn_ids) : doc_tkns
      doc_tkns = (turn_off) ? doc_tkns.filter((tkn) => {return (turn_off && !tkn_ids.includes(tkn))}) : doc_tkns
      doc_tkns = [...new Set(doc_tkns)] // remove duplicates
      doc_tkns = doc_tkns.filter((tkn_id) => {return !isPunct(doc_json.filter((word) => {return word.tkn_id===tkn_id})[0].word)}) // ignore punctuation    
      doc_tkns = doc_tkns.sort(function(a, b) {return a - b;}) // sort
      
      
      
      
      
      console.log(`tkn_ids:${JSON.stringify(tkn_ids)}`)
      console.log(`doc_tkns:${JSON.stringify(doc_tkns)}`)

      const msgs_json = guided_annotation_messages["goldMentions"][CurrSentInd]
      console.log(`msgs_json:`)
      console.log(msgs_json)
      console.log('msgs_json["doc_tkns_alignments"]:')
      console.log(msgs_json["doc_tkns_alignments"])
      // console.log(`curr_alignment_guiding_msg_id: ${curr_alignment_guiding_msg_id} and its type: ${typeof curr_alignment_guiding_msg_id}`)
      // unalignable parts
      if (msgs_json["doc_tkns_alignments"][curr_alignment_guiding_msg_id].length===0) {
        if (doc_tkns.length===0){
          return {"alignment_ok":true, "highlighted_doc_tkns":doc_tkns, "gold_align_tkns":[]} 
        } else {
          return {"alignment_ok":false, "highlighted_doc_tkns":doc_tkns, "gold_align_tkns":[]} 
        }
      }




      
      const gold_align_tkns  = msgs_json["doc_tkns_alignments"][curr_alignment_guiding_msg_id].map((span) => string_to_span(span))
      if (gold_align_tkns.map((span) => JSON.stringify(span)).includes(JSON.stringify(doc_tkns))) {
          return {"alignment_ok":true, "highlighted_doc_tkns":doc_tkns, "gold_align_tkns":gold_align_tkns} 
      } else {
        return {"alignment_ok":false, "highlighted_doc_tkns":doc_tkns, "gold_align_tkns":gold_align_tkns} 
      }
    }







    

  /********************************************************************************************************************************************************************* */

  /*******  useState for smooth transition to "SENTENCE END" or "SUMMARY END" *******/
  const finishedSent = useRef(false);

  useEffect(() => {
    const isNotStart = (StateMachineState !== "START" && summary_json.filter((word) => {return word.sent_id===CurrSentInd && word.shadowed}).length !== 0);
    const isAllSentHighlighted = (summary_json.filter((word) => { return word.sent_id===CurrSentInd && !(word.all_highlighted || word.span_highlighted) && !isPunct(word.word)}).length === 0); // need "isNotStart" because also for "START" state isAllSentHighlighted=true because no sentence is span-highlighted yet 
    if (isAllSentHighlighted && isNotStart && !finishedSent.current && !["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) {
      finishedSent.current = true;


      const isLastSent = (Math.max.apply(Math, summary_json.map(word => { return word.sent_id; })) === CurrSentInd)
      if (isLastSent) {
        MachineStateHandlerWrapper({forceState:"SUMMARY END"});   
      } else {
        MachineStateHandlerWrapper({forceState:"SENTENCE END"});   
      }
    }

    // if regretted summary highlighting
    else if(!isAllSentHighlighted && isNotStart && finishedSent.current && !["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) { 
      finishedSent.current = false;
      MachineStateHandlerWrapper({forceState:"ANNOTATION"});
    }
  }, [summary_json]);
  /*********************************************************************************/ 

  /*********** useState to update the summary shadow when next sentence ***********/ 
  useEffect(() => {
    console.log("guided_annotation_messages:")
    console.log(guided_annotation_messages);
    SetSummaryShadowAndUpdateHighlights(CurrSentInd);
  }, [CurrSentInd]);
  /********************************************************************************/

  /***************************** bolding controlling *****************************/ 
  useEffect(() => {
    // when choosing a span - if nothing is span_highlighted then all sent matches are in bold, otherwise only span_highlighted matches (when highlighting - something must be span-highlighted so automatically is '2')
    if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState) && !sliderBoldStateActivated) {
      const bold_state = (summary_json.filter((word) => {return word.span_highlighted}).length === 0) ? '3' : '2'; // if no span is current highlighted - bold everything, otherwise bold only currently highlighted span
      boldStateHandler(undefined, bold_state);
    } else if (["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState) && !sliderBoldStateActivated) {
      boldStateHandler(undefined, '1');
    }
  }, [StateMachineState, summary_json]);
  /********************************************************************************/

   /***************************** old alignments controlling *****************************/ 
   const prevState = useRef("")
   useEffect(() => {
     if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState)) {
       oldAlignmentStateHandler({event:undefined, newValue:'3', sent_ind:-1});
     } else if (StateMachineState === "REVISE CLICKED"){
       oldAlignmentStateHandler({event:undefined, newValue:'1', sent_ind:-1});
     } else if (StateMachineState === "REVISE HOVER"){
       oldAlignmentStateHandler({event:undefined, newValue:'3', sent_ind:-1});
     }
     prevState.current = StateMachineState;
   }, [StateMachineState, AlignmentCount]);
   /********************************************************************************/
  //  useEffect(() => {
  //    console.log(`CurrSentInd is updated and is now ${CurrSentInd}`)
  //   //  console.log(`AVIVSL: wanted words are:${JSON.stringify(doc_json.filter((word)=> { return ["came", "come"].includes(word.word)}).map((word) => word.tkn_id))}`)
  //  }, [CurrSentInd]);

  //  useEffect(() => {
  //   console.log(`tkn_id of highlighted summary words: ${JSON.stringify(summary_json.filter((word)=>{return word.span_highlighted}).map((word) => word.tkn_id))}`)
  // }, [summary_json]);

  // useEffect(() => {
  //   console.log(`tkn_id of highlighted doc words: ${JSON.stringify(doc_json.filter((word)=>{return word.span_highlighted}).map((word) => word.tkn_id))}`)
  // }, [doc_json]);
  useEffect(() => {
    console.log(`is_good_alignment here: ${is_good_alignment}`)
  }, []);

   
   /******************* highlighting while choosing spans to help *******************/ 


   useEffect(() => {
     if (DocOnMouseDownID !== "-1"){
       setDocOnMouseDownActivated(true)
     } else if (DocOnMouseDownID === "-1"){
       setDocOnMouseDownActivated(false)
     } 
     
     if (SummaryOnMouseDownID !== "-1") {
       setSummaryOnMouseDownActivated(true)
     } else {
       setSummaryOnMouseDownActivated(false)
     }
   }, [DocOnMouseDownID,SummaryOnMouseDownID]);
   
   //AVIVSL: TODO: find way to reset the whole hovering process when the onMouseUp occurs outside of the text (maybe when docOnMouseDownActivated===false or summaryOnMouseDownActivated===false) --> maybe use a useRef to remember which one was the one activated - summary or doc?
   useEffect(() => {
     if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)){
       if(docOnMouseDownActivated) {
        //  console.log(`DocOnMouseDownID is ${DocOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
         const min_ID =  (DocOnMouseDownID > hoverActivatedId) ? hoverActivatedId : DocOnMouseDownID;
         const max_ID =  (DocOnMouseDownID > hoverActivatedId) ? DocOnMouseDownID : hoverActivatedId;
         let chosen_IDs = [];
         for(let i=min_ID; i<=max_ID; i++){
           chosen_IDs.push(i);
         }
         setDocJson(doc_json.map((word) => chosen_IDs.includes(word.tkn_id)? {...word, span_alignment_hover:true}:{...word, span_alignment_hover:false}))
       } else if (!docOnMouseDownActivated){
         setDocJson(doc_json.map((word) => {return {...word, span_alignment_hover:false}}))
       }
       if(summaryOnMouseDownActivated) {
        //  console.log(`SummaryOnMouseDownID is ${SummaryOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
         const min_ID =  (SummaryOnMouseDownID > hoverActivatedId) ? hoverActivatedId : SummaryOnMouseDownID;
         const max_ID =  (SummaryOnMouseDownID > hoverActivatedId) ? SummaryOnMouseDownID : hoverActivatedId;
         let chosen_IDs = [];
         for(let i=min_ID; i<=max_ID; i++){
           chosen_IDs.push(i);
         }
         setSummaryJson(summary_json.map((word) => chosen_IDs.includes(word.tkn_id)? {...word, span_alignment_hover:true}:{...word, span_alignment_hover:false}))
       } else if (!summaryOnMouseDownActivated){
         setSummaryJson(summary_json.map((word) => {return {...word, span_alignment_hover:false}}))
         
         if (isRedLettered(hoverActivatedId) && hoverActivatedDocOrSummary === "summary") {
           const doc_tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id:doc_id, summary_ids:[hoverActivatedId], isHover:true})});

           setDocJson(doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? {...word, red_color:true} : {...word, red_color:false}))  
         }  
       }
     }
   }, [docOnMouseDownActivated, summaryOnMouseDownActivated, hoverActivatedId]);


   // close the guiding message
   useEffect(() => {
    if(guiding_msg_type!=="closed") {
      window.setTimeout(()=>{setGuidingMsgType("closed");setGuidingMsg({"text":"", "title":""});},guiding_msg["timeout"])
    }
   }, [guiding_msg_type])


   // check if alignment ok (for guidinbg annotation message)
   useEffect(() => {
     if(CurrSentInd>=0 && curr_alignment_guiding_msg_id!=="-1") {
      const isAlignmentOkDict = isAlignmentOk(doc_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id), false, false)
      const isSummarySpanOkDict = isSummarySpanOk(summary_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id), false, false) // if changes summary span after was approved
      setIsGoodAlignment(isAlignmentOkDict["alignment_ok"] && isSummarySpanOkDict["summary_span_ok"])
     }
   }, [doc_json, summary_json])



   const SubmitHandler = (event) => {
    const isAlignmentOkDict = isAlignmentOk();
    if (isAlignmentOkDict["alignment_ok"]) {
      // setGuidingMsg(guided_annotation_messages["default_good_alignment_msg"]) // AVIVSL: add custom success messages
      // setGuidingMsgType("success");
      setCurrAlignmentGuidingMsgId("-1");
    } else {
      update_error_message(isAlignmentOkDict["gold_align_tkns"], isAlignmentOkDict["highlighted_doc_tkns"], curr_alignment_guiding_msg_id, true);
      return
    }
    alert("Submitted!");
  }




   return (
     <>
          <Annotation
              isTutorial = {false}                                        isGuidedAnnotation = {true} 
              task_id = {'0'}                                             doc_paragraph_breaks = {doc_paragraph_breaks}
              doc_json = {doc_json}                                       setDocJson = {setDocJson}
              summary_json = {summary_json}                               setSummaryJson = {setSummaryJson}
              all_lemma_match_mtx = {all_lemma_match_mtx}                 important_lemma_match_mtx = {important_lemma_match_mtx}
              StateMachineState = {StateMachineState}                     SetStateMachineState = {SetStateMachineState}
              handleErrorOpen = {handleErrorOpen}                         isPunct = {isPunct}
              toggleSummarySpanHighlight = {toggleSummarySpanHighlight}   toggleDocSpanHighlight = {toggleDocSpanHighlight}
              boldState = {boldState}                                     boldStateHandler = {boldStateHandler}
              SubmitHandler = {SubmitHandler}                             hoverHandler = {hoverHandler}
              CurrSentInd = {CurrSentInd}                                 SetCurrSentInd = {SetCurrSentInd}
              InfoMessage = {InfoMessage}                                 MachineStateHandlerWrapper = {MachineStateHandlerWrapper}
              AlignmentCount = {AlignmentCount}                           SetAlignmentCount = {SetAlignmentCount}
              oldAlignmentState = {oldAlignmentState}                     oldAlignmentStateHandler = {oldAlignmentStateHandler}
              DocOnMouseDownID = {DocOnMouseDownID}                       SetDocOnMouseDownID = {SetDocOnMouseDownID}
              SummaryOnMouseDownID = {SummaryOnMouseDownID}               SetSummaryOnMouseDownID = {SetSummaryOnMouseDownID}
              docOnMouseDownActivated = {docOnMouseDownActivated}         setDocOnMouseDownActivated = {setDocOnMouseDownActivated}
              summaryOnMouseDownActivated = {summaryOnMouseDownActivated} setSummaryOnMouseDownActivated = {setSummaryOnMouseDownActivated}
              setHoverActivatedId = {setHoverActivatedId}                 setHoverActivatedDocOrSummary = {setHoverActivatedDocOrSummary}
              t_StateMachineStateId = {undefined}                          t_SetStateMachineStateId = {undefined}
              t_start_doc_json = {undefined}                               t_middle_doc_json = {undefined}
              t_sent_end_doc_json = {undefined}                            t_submit_doc_json = {undefined}
              t_start_summary_json = {undefined}                           t_middle_summary_json = {undefined}
              t_sent_end_summary_json = {undefined}                        t_submit_summary_json = {undefined}
              t_state_messages = {undefined}
              g_guiding_info_msg = {guiding_info_msg}                      g_is_good_alignment = {is_good_alignment}
            />

                <Alert show={guiding_msg_type!=="closed"} style={{position:"fixed", bottom:"1%", left:"50%", transform:"translate(-50%, 0%)", width:"50%"}} variant={guiding_msg_type} onClose={() => setGuidingMsgType("closed")} dismissible>
                        <Alert.Heading>{guiding_msg["title"]}</Alert.Heading>
                        <p>
                          <Markup content={guiding_msg["text"]} />
                        </p>
                </Alert>

      </>
   )

}

export default GuidedAnnotation
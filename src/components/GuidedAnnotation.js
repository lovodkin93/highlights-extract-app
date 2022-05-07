import { MachineStateHandler } from './Annotation_event_handlers';
import { add_text_to_GuidedAnnotationInfoAlert, string_to_span } from './GuidedAnnotation_utils'

import { useState, useEffect, useRef } from 'react'
import Annotation from './Annotation';
import Alert from 'react-bootstrap/Alert'
import Fade from 'react-bootstrap/Fade'
import { Markup } from 'interweave';
import { statSync } from 'fs';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

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
                          prevCurrSentInd, setPrevCurrSentInd,
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
                          guided_unhighlight, setGuidedUnhighlight,
                          is_good_alignment, setIsGoodAlignment,
                          setCompleted, resetGuidedAnnotation,
                          g_show_hint, g_setShowHint,
                          g_hint_msg, g_setHintMsg, 
                          guided_annotation_hints, guided_annotation_strike_messages,
                          noAlignModalShow, setNoAlignModalShow,
                          noAlignApproved, setNoAlignApproved,
                          setOpeningModalShow,
                          setPrevCurrAlignmentGuidingMsgId, prev_curr_alignment_guiding_msg_id,
                          setPrevGuidingInfoMsg, prev_guiding_info_msg,
                          setPrevGuiderMsg, prev_Guider_msg,
                          g_guided_annotation_history, g_setGuidedAnnotationHistory,
                          g_strikes_counter, g_setStrikesCounter,
                          g_answer_modal_msg, g_setAnswerModalMsg,
                          g_answer_words_to_glow, g_setAnswerWordsToGlow,
                          g_Guider_msg, g_setGuiderMsg,
                          showAlert, setShowAlert,
                          SUMMARY_WORD_CNT_THR,
                          SubmitModalShow, setSubmitModalShow



                        }) => {
    const MAX_ERR_CNT = 0 // number of maximum permitted wrong attempts before giving the answer 
    const [FinishedModalShow, setFinishedModalShow] = useState(false);
    const [showWhereNavbar, setShowWhereNavbar] = useState(false);
    const [g_open_hint, g_setOpenHint] = useState(false)
    const [g_with_glow_hint, g_setWithGlowHint] = useState(false)
    

    
    const update_guiding_msg = (new_msg_type, msg_json) => {
      // message didn't close before new message and they are of the same kind (so someone might miss the change)
      if(guiding_msg_type === new_msg_type){
        setGuidingMsgType("closed")
        window.setTimeout(()=>{setGuidingMsgType(new_msg_type);setGuidingMsg(msg_json);},50)
      }
      else {
        setGuidingMsgType(new_msg_type);
        setGuidingMsg(msg_json);
      }
    }




    
    const toggleDocSpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
      if (tkn_ids.length===0) {
        return
      }

      const isSummarySpanOkDict = isSummarySpanOk([], false, false)
      
      if(!isSummarySpanOkDict["summary_span_ok"] && StateMachineState !== "REVISE HOVER") {
        if (isSummarySpanOkDict["highlighted_tkn_ids"].length===0) { // nothing highlighted in summary
          // setGuidingMsg(guided_annotation_messages["empty_summary_span_msg"])
          // setGuidingMsgType("danger")

          update_guiding_msg("danger", guided_annotation_messages["empty_summary_span_msg"])
          g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":"summary_span", "problem":"short", "chosen_span_id":"-1", "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"], "gold_tkn_ids":[]}]))
          
          g_setHintMsg({"text":"", "title":""})
          g_setShowHint(false)
        } else if (isSummarySpanOkDict["chosen_span_id"]===undefined){
          // setGuidingMsg(guided_annotation_messages["default_too_short_summary_msg"])
          // setGuidingMsgType("danger")

          update_guiding_msg("danger", guided_annotation_messages["default_too_short_summary_msg"])
          g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":"summary_span", "problem":"short", "chosen_span_id":"-1", "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"], "gold_tkn_ids":[]}]))

          g_setHintMsg({"text":"", "title":""})
          g_setShowHint(false)
        } else {
          let gold_tkns = guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_spans"][isSummarySpanOkDict["chosen_span_id"]]
          gold_tkns = gold_tkns.map((span) => {return string_to_span(span)})
          update_error_message(gold_tkns, isSummarySpanOkDict["highlighted_tkn_ids"], isSummarySpanOkDict["chosen_span_id"], false)
        }
        return
      }

      const isAlignmentOkDict = isAlignmentOk(tkn_ids, turn_on, turn_off);
      if (isAlignmentOkDict["alignment_ok"] && StateMachineState !== "REVISE HOVER") {
        if (Object.keys(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id]).includes("text")) {
          // setGuidingMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id])
          update_guiding_msg("success", guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id])
          setGuidingInfoMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_alignment_msg"][curr_alignment_guiding_msg_id])
        } else {
          // setGuidingMsg(guided_annotation_messages["default_good_alignment_msg"])
          update_guiding_msg("success", guided_annotation_messages["default_good_alignment_msg"])
          setGuidingInfoMsg(guided_annotation_messages["default_good_alignment_msg"])
        }
        // setGuidingMsgType("success");
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false);
        g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"success", "sent_id":CurrSentInd, "type":"doc_span", "chosen_span_id":curr_alignment_guiding_msg_id, "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"]}]))
        // setIsGoodAlignment(true);
      }
      else if (StateMachineState !== "REVISE HOVER") {
        // updating the info message
        if (Object.keys(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][curr_alignment_guiding_msg_id]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][curr_alignment_guiding_msg_id])
          if(g_Guider_msg["type"]!=="reveal-answer" && g_Guider_msg["where"]!=="doc"){
            g_setGuiderMsg({"type":"info", "where":"doc", "text":guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][curr_alignment_guiding_msg_id]["text"]})
          }
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_find_alignment"])
          if(g_Guider_msg["type"]!=="reveal-answer" && g_Guider_msg["where"]!=="doc"){
            g_setGuiderMsg({"type":"info", "where":"doc", "text":guided_annotation_info_messages["default_find_alignment"]["text"]})
          }
        }
      } 


      setSliderBoldStateActivated(false)
      if (turn_on){
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word))
      } else if (turn_off){
          setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false,  span_alignment_hover:false } : word))
      } else {
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word))
      }
    }
  
    toggleDocSpanHighlight.defaultProps = {
      turn_on: false,
      turn_off: false
    }
  
  
    
  
    const toggleSummarySpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
       // if no change was done to the summary - no need to update
      if(tkn_ids.length===0) {
        return
      }

      const isSummarySpanOkDict = isSummarySpanOk(tkn_ids, turn_on, turn_off)
      if(isSummarySpanOkDict["summary_span_ok"]) {
        // updating the success alert
        if (Object.keys(guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_span_msg"][isSummarySpanOkDict["chosen_span_id"]]).includes("text")) {
          // setGuidingMsg(guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_span_msg"][isSummarySpanOkDict["chosen_span_id"]])
          update_guiding_msg("success", guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_span_msg"][isSummarySpanOkDict["chosen_span_id"]])

        } else {
          // setGuidingMsg(guided_annotation_messages["default_good_summary_span_msg"]) 
          update_guiding_msg("success", guided_annotation_messages["default_good_summary_span_msg"])

        }
        // setGuidingMsgType("success");
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false);
        g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"success", "sent_id":CurrSentInd, "type":"summary_span", "chosen_span_id":isSummarySpanOkDict["chosen_span_id"], "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"]}]))
        setCurrAlignmentGuidingMsgId(isSummarySpanOkDict["chosen_span_id"])


        // updating the info message
        // console.log(`CurrSentInd:${CurrSentInd}`)
        if (Object.keys(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][isSummarySpanOkDict["chosen_span_id"]]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][isSummarySpanOkDict["chosen_span_id"]])
          if(g_Guider_msg["where"]!=="doc") {
            g_setGuiderMsg({"type":"info", "where":"doc", "text":guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][isSummarySpanOkDict["chosen_span_id"]]["text"]})
          }
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_find_alignment"])
          if(g_Guider_msg["where"]!=="doc") {
            g_setGuiderMsg({"type":"info", "where":"doc", "text":guided_annotation_info_messages["default_find_alignment"]["text"]})
          }
        }
      } 
      else {
        // updating the info message
        const guiding_info_sent_id = (["START", "SENTENCE END"].includes(StateMachineState)) ? CurrSentInd+1 : CurrSentInd
        if (Object.keys(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"])
          if(g_Guider_msg["type"]!=="reveal-answer" && g_Guider_msg["where"]!=="summary"){
            g_setGuiderMsg({"type":"info", "where":"summary", "text":guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]["text"]})
          }
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_choose_summary_span"])
          if(g_Guider_msg["type"]!=="reveal-answer" && g_Guider_msg["where"]!=="summary"){
            g_setGuiderMsg({"type":"info", "where":"summary", "text":guided_annotation_info_messages["default_choose_summary_span"]["text"]})
          }
        }

        // if the span/alignment were good - updating it.
        setIsGoodAlignment(false)
        setCurrAlignmentGuidingMsgId("-1")
      }


      setSliderBoldStateActivated(false)
      if (turn_on){
        setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word));
      } else if (turn_off){
        setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false,  span_alignment_hover:false } : word));
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
        setPrevCurrSentInd(CurrSentInd)
        setPrevCurrAlignmentGuidingMsgId(curr_alignment_guiding_msg_id)
        setPrevGuidingInfoMsg(guiding_info_msg)
        setPrevGuiderMsg(g_Guider_msg)


        setDocJson(doc_json.map((word) => {return {...word, span_highlighted: false}}))
        setSummaryJson(summary_json.map((word) => {return {...word, span_highlighted: false}}))
      }
      SetCurrSentInd(-1)
    }
  
    const ExitReviseHandler = () => {
      setDocJson(doc_json.map((word, ind) => prevDocSpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))
      setSummaryJson(summary_json.map((word, ind) => prevSummarySpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))               
      const prev_state = prevStateMachineState;
      SetStateMachineState(prevStateMachineState);
      
      const prev_current_sent_id = prevCurrSentInd
      SetCurrSentInd(prev_current_sent_id)
      
      const prev_guiding_msg_id = prev_curr_alignment_guiding_msg_id
      setCurrAlignmentGuidingMsgId(prev_guiding_msg_id) 

      setGuidingInfoMsg(prev_guiding_info_msg)
      g_setGuiderMsg(prev_Guider_msg)
      g_setHintMsg({"text":"", "title":""})
      setPrevCurrAlignmentGuidingMsgId("-1")
      setPrevCurrSentInd(-1)
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
    
      const chosen_align_currSentId = summary_json.filter((word) => {return word.alignment_id.includes(chosen_align_id)})[0].sent_id
      SetCurrSentInd(chosen_align_currSentId)  



      
      
      const gold_mentions = guided_annotation_messages["goldMentions"][chosen_align_currSentId]

      let highlighted_tkn_ids = summary_json.filter((word) => {return word.alignment_id.includes(chosen_align_id)}).map((word) => {return word.tkn_id})
      highlighted_tkn_ids = highlighted_tkn_ids.filter((tkn_id) => {return !isPunct(summary_json.filter((word) => {return word.tkn_id===tkn_id})[0].word)}) // ignore punctuation  
      highlighted_tkn_ids = highlighted_tkn_ids.sort(function(a, b) {return a - b;}) // order    
      let chosen_span_id = Object.keys(gold_mentions["span_indicating_tkns"]).filter((key) => {return gold_mentions["span_indicating_tkns"][key].some((span) => hasSubArray(highlighted_tkn_ids, string_to_span(span)))})
      if(chosen_span_id.length===0){
        console.log("zero!!!")
      }
      setCurrAlignmentGuidingMsgId(chosen_span_id[0])
      
      
      // console.log(`AVIVSL:${JSON.stringify(chosen_span_id)}`)
      // setPrevCurrAlignmentGuidingMsgId, prev_curr_alignment_guiding_msg_id



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
      if (!newValue){
        setBoldState("none");
        SetDocBoldface([]);
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
      // no alignment
      if ((typeof forceState !== 'string') && (!["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) && (doc_json.filter((word) => {return word.span_highlighted}).length === 0) && (StateMachineState!=="START") && !noAlignApproved) {
        setNoAlignModalShow(true)
        return
      }
      setNoAlignApproved(false)




      if((forceState === undefined)  && !["REVISE HOVER", "START", "SENTENCE START"].includes(StateMachineState)) {
        // check if span is ok
        const isSummarySpanOkDict = isSummarySpanOk([], false, false)
        // console.log(`state: ${StateMachineState} and ${JSON.stringify(isSummarySpanOkDict)}`)
        if(!isSummarySpanOkDict["summary_span_ok"]) {
          if (isSummarySpanOkDict["highlighted_tkn_ids"].length===0 && StateMachineState !== "REVISE HOVER") { // nothing highlighted in summary
            // setGuidingMsg(guided_annotation_messages["empty_summary_span_msg"])
            // setGuidingMsgType("danger")
            update_guiding_msg("danger", guided_annotation_messages["empty_summary_span_msg"])
            g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":"summary_span", "problem":"short", "chosen_span_id":"-1", "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"], "gold_tkn_ids":[]}]))

          } else if (isSummarySpanOkDict["chosen_span_id"]===undefined){
            // setGuidingMsg(guided_annotation_messages["default_too_short_summary_msg"])
            // setGuidingMsgType("danger")
            update_guiding_msg("danger", guided_annotation_messages["default_too_short_summary_msg"])
            g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":"summary_span", "problem":"short", "chosen_span_id":"-1", "highlighted_tkn_ids":isSummarySpanOkDict["highlighted_tkn_ids"], "gold_tkn_ids":[]}]))
            g_setHintMsg({"text":"", "title":""})
            g_setShowHint(false)
          } else {
            let gold_tkns = guided_annotation_messages["goldMentions"][CurrSentInd]["good_summary_spans"][isSummarySpanOkDict["chosen_span_id"]]
            gold_tkns = gold_tkns.map((span) => {return string_to_span(span)})
            update_error_message(gold_tkns, isSummarySpanOkDict["highlighted_tkn_ids"], isSummarySpanOkDict["chosen_span_id"], false)
          }
          return
        }
      }
      
      // check if alignment is good
      if (forceState === undefined && !["START", "REVISE HOVER"].includes(StateMachineState)) { 
        const isAlignmentOkDict = isAlignmentOk();
        if (isAlignmentOkDict["alignment_ok"]) {
          // setGuidingMsg(guided_annotation_messages["default_good_alignment_msg"]) // AVIVSL: add custom success messages
          // setGuidingMsgType("success");
          setCurrAlignmentGuidingMsgId("-1");
          g_setHintMsg({"text":"", "title":""})
          g_setShowHint(false);
        } else {
          update_error_message(isAlignmentOkDict["gold_align_tkns"], isAlignmentOkDict["highlighted_doc_tkns"], curr_alignment_guiding_msg_id, true);
          return
        }
      }

      // check if span is ok (for the case when the summary span was changed after the alignment was approved)
      if (forceState === undefined && !["START", "REVISE HOVER"].includes(StateMachineState)) { 
        const isSummarySpanOkDict = isSummarySpanOk([], false, false)
      
        if(!isSummarySpanOkDict["summary_span_ok"]) {
          // setGuidingMsg({"text":"Summary highlighting was changed and is not aligned to the document highlighting anymore.", "title":"Summary highlighting changed and is not good"})
          // setGuidingMsgType("danger")
          update_guiding_msg("danger", {"text":"Summary highlighting was changed and is not aligned to the document highlighting anymore.", "title":"Summary highlighting changed and is not good"})

          return
        }



      }


      // info messages(alerts)
      if (forceState==="REVISE HOVER" && StateMachineState!=="REVISE CLICKED"){
        setGuidingInfoMsg(guided_annotation_info_messages["Revise Hover"])
        g_setGuiderMsg({"type":"", "where":"", "text":""})
      } 
      else if (forceState===undefined && StateMachineState==="REVISE HOVER") {
        setGuidingInfoMsg(guided_annotation_info_messages["Revise Clicked"])
        g_setGuiderMsg({"type":"", "where":"", "text":""})
      }
      else if (forceState===undefined && StateMachineState==="REVISE CLICKED") {
        setGuidingInfoMsg(guided_annotation_info_messages["Revise Confirmed Revision"])
        g_setGuiderMsg({"type":"", "where":"", "text":""})
      }
      else if (forceState==="REVISE HOVER" && StateMachineState==="REVISE CLICKED") {
        setGuidingInfoMsg(guided_annotation_info_messages["Revise Clicked BACK"])
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
        g_setGuiderMsg({"type":"", "where":"", "text":""})
      }
      else if (forceState===undefined) {
        const guiding_info_sent_id = (["START", "SENTENCE END"].includes(StateMachineState)) ? CurrSentInd+1 : CurrSentInd
        if (Object.keys(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]).includes("text")) {
          setGuidingInfoMsg(guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"])
          if(g_Guider_msg["where"]!=="summary"){
            g_setGuiderMsg({"type":"info", "where":"summary", "text":guided_annotation_info_messages["custom_messages"][guiding_info_sent_id]["choose_summary_span"]["text"]})
          }
        } else {
          setGuidingInfoMsg(guided_annotation_info_messages["default_choose_summary_span"])
          if(g_Guider_msg["where"]!=="summary"){
            g_setGuiderMsg({"type":"info", "where":"summary", "text":guided_annotation_info_messages["default_choose_summary_span"]["text"]})
          }
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

    // const string_to_span = (span_str) => {
    //   const sub_strings = span_str.split(";");
    //   const lims = sub_strings.map((sub_string) => sub_string.split("-").map((lim) => parseInt(lim)))
    //   // console.log(`lims:${JSON.stringify(span_str)}`)
    //   const ids = lims.map(([start, end]) => Array(end - start + 1).fill().map((_, idx) => start + idx)).flat(1)
    //   return ids.sort(function(a, b) {return a - b;})
    // }

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
      const hint_msgs = guided_annotation_hints["goldMentions"][CurrSentInd][msg_type_key][chosen_span_id]

      const excess_tkns = actual_tkns.filter((tkn) => {return gold_tkns.every((span) => {return !span.includes(tkn)})}).sort(function(a, b) {return a - b;})
      
      g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":`${(isAlignError)? "doc_span":"summary_span"}`, "problem":"long", "chosen_span_id":chosen_span_id, "highlighted_tkn_ids":actual_tkns, "gold_tkn_ids":gold_tkns}]))


      if (guiding_msgs.length===0){
        // setGuidingMsg(guided_annotation_messages[default_msg_key])
        // setGuidingMsgType("danger")
        update_guiding_msg("danger", guided_annotation_messages[default_msg_key])
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
        return
      }



  
      
      
      
      const custom_message_json = guiding_msgs.filter((json_obj) => {return json_obj["excess_tkns"].some((span) => {return intersection(excess_tkns, string_to_span(span)).length !==0 })})
      if(custom_message_json.length !== 0) {
        if(!guided_unhighlight){
          setGuidedUnhighlight(true)
        }
        // setGuidingMsg(custom_message_json[0])
        update_guiding_msg("danger", custom_message_json[0])

      } 
      else {
        // setGuidingMsg(guided_annotation_messages[default_msg_key])
        update_guiding_msg("danger", guided_annotation_messages[default_msg_key])

        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
      }
      // setGuidingMsgType("danger")



      const custom_hint_json = hint_msgs.filter((json_obj) => {return json_obj["excess_tkns"].some((span) => {return intersection(excess_tkns, string_to_span(span)).length !==0 })})
      if(custom_hint_json.length !== 0) {
        if(guided_unhighlight){
          g_setHintMsg(custom_hint_json[0])
        } else {
          g_setHintMsg({"text":`${custom_hint_json[0]["text"]} ${(custom_hint_json[0]["text"].endsWith("</ol>")) ? "" : "<br/>"} ${guided_annotation_messages["extra_to_excess_msgs"]["text"]}`, "title": custom_hint_json[0]["title"]})
          setGuidedUnhighlight(true)
        }
        g_setShowHint(true)
      } 
      else {
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
      }

    }



    const changeSummarySentHandler = ({isNext}) => {
      if (isNext){
        SetCurrSentInd(CurrSentInd+1)
        const summary_currSent_old_highlighted_tkn_cnt = summary_json.filter((word) => {return (!isPunct(word.word) && word.sent_id===CurrSentInd && word.old_alignments)}).length // number of words in curr sentence (the one we change from) that was saved as part of an alignment
        const summary_currSent_tkn_cnt = summary_json.filter((word) => {return (!isPunct(word.word) && word.sent_id===CurrSentInd)}).length // all (non-punctuation) words in curr sentence (the one we change from)
  
        if(summary_currSent_old_highlighted_tkn_cnt / summary_currSent_tkn_cnt > SUMMARY_WORD_CNT_THR) {
          setShowAlert("success")
          console.log("good!")
        } else {
          setShowAlert("warning")
          console.log("bad!")
        }
      
      } else {
        SetCurrSentInd(CurrSentInd-1)
      }
      setDocJson(doc_json.map((word) => {return {...word, span_highlighted:false}}))
      setSummaryJson(summary_json.map((word) => {return {...word, span_highlighted:false}}))
    }


    const update_missing_message = (gold_tkns, actual_tkns, chosen_span_id, isAlignError) => {

      const msg_type_key = (isAlignError) ? "missing_alignment_msg" : "too_short_summary_msgs" 
      const default_msg_key = (isAlignError) ? "default_missing_alignment_msg" : "default_too_short_summary_msg" 

      const guiding_msgs = guided_annotation_messages["goldMentions"][CurrSentInd][msg_type_key][chosen_span_id]
      const hint_msgs = guided_annotation_hints["goldMentions"][CurrSentInd][msg_type_key][chosen_span_id]

      
      const merged_gold_tkns = [...new Set(gold_tkns.flat(1))].sort(function(a, b) {return a - b;})
      const missing_tkns = merged_gold_tkns.filter((tkn) => {return !actual_tkns.includes(tkn)})
      const custom_message_json = guiding_msgs.filter((json_obj) => {return json_obj["missing_tkns"].some((span) => {return intersection(missing_tkns, string_to_span(span)).length !== 0 })})


      g_setGuidedAnnotationHistory(g_guided_annotation_history.concat([{"status":"error", "sent_id":CurrSentInd, "type":`${(isAlignError)? "doc_span":"summary_span"}`, "problem":"short", "chosen_span_id":chosen_span_id, "highlighted_tkn_ids":actual_tkns, "gold_tkn_ids":gold_tkns}]))



      if(custom_message_json.length !== 0) {
        // setGuidingMsg(custom_message_json[0])
        // setGuidingMsgType("danger")
        update_guiding_msg("danger", custom_message_json[0])
      } else {
        // setGuidingMsg(guided_annotation_messages[default_msg_key])
        // setGuidingMsgType("danger")
        update_guiding_msg("danger", guided_annotation_messages[default_msg_key])

        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
      }
      
      const custom_hint_json = hint_msgs.filter((json_obj) => {return json_obj["missing_tkns"].some((span) => {return intersection(missing_tkns, string_to_span(span)).length !== 0 })})
      if(custom_hint_json.length !== 0) {
        g_setHintMsg(custom_hint_json[0])
        g_setShowHint(true)
      } else {
        g_setHintMsg({"text":"", "title":""})
        g_setShowHint(false)
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

      const msgs_json = guided_annotation_messages["goldMentions"][CurrSentInd]

      // unalignable parts
      console.log(`curr_alignment_guiding_msg_id:${curr_alignment_guiding_msg_id}`)
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



    const OpenHint = () => {
      window.scrollTo(0, 0)
      g_setOpenHint(true)
      g_setWithGlowHint(true)
    }

    const allSummarySentIsHighlighted = () => {
      return summary_json.filter((word) => {return (word.sent_id === CurrSentInd && !isPunct(word.word) && !word.old_alignments && !["while", "from", "countries", "like", "Brazil"].includes(word.word))}).length === 0
    }


    const getAnswerModalMsg = (last_error_json) => {
      if(last_error_json["gold_tkn_ids"].length!==0 && last_error_json["gold_tkn_ids"][0].includes(10000000)){
        setSummaryJson(summary_json.map((word) => {return (["while", "from", "countries", "like", "Brazil", "."].includes(word.word)) ? {...word, span_highlighted:false}:word}))
        setDocJson(doc_json.map((word) => {return {...word, span_highlighted:false}}))
        if(CurrSentInd===1) {
          setCurrAlignmentGuidingMsgId("-1")
          g_setGuiderMsg({"type":"info", "where":"summary", "text":`Choose a different summary span.`})
        }
        else if (CurrSentInd===2) {
          console.log(`AVIVSL:${JSON.stringify(summary_json.filter((word) => {return !["from", "countries", "like", "Brazil"].includes(word.word) && !isPunct(word.word)}))}`)
          if (summary_json.filter((word) => {return word.span_highlighted && !["from", "countries", "like", "Brazil"].includes(word.word) && !isPunct(word.word)}).length === 0) {
            setCurrAlignmentGuidingMsgId("-1")
            g_setGuiderMsg({"type":"info", "where":"summary", "text":`Choose a different summary span.`})
          } else {
            const chosen_span_id = last_error_json["chosen_span_id"]
            setCurrAlignmentGuidingMsgId((parseInt(chosen_span_id)+1).toString())
            g_setGuiderMsg({"type":"info", "where":"doc", "text":`${guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][parseInt(chosen_span_id)+1]["text"]} <br/><u>Notice</u> that \"from countries like Brazil\" was un-highlighted in the summary (it is not mentioned in the document).`})
          }
        }
        return `${(CurrSentInd===2) ? "\"from countries like Brazil\"":"\"while\""} doesn't appear explicitly in the document and therefore should be left un-highlighted.`
      }

      if(last_error_json["highlighted_tkn_ids"].length===0){
        const where_to_highlight = (last_error_json["type"] === "summary_span") ? "summary":"doc"
        const what_next = (last_error_json["type"] === "summary_span") ? "proceeding to the document or hitting \"CONFIRM\"" : "hitting \"CONFIRM\""

        // g_setGuiderMsg({"type":"reveal-answer", "where":where_to_highlight, "text":`Start by highlighting something in the ${where_to_highlight}`})      
        return `<div>Please highlight something in the <u>${where_to_highlight}</u> before ${what_next}!</div>`
      }
      const gold_mentions = guided_annotation_strike_messages["goldMentions"][last_error_json["sent_id"]]
      const error_type = last_error_json["type"];

      let chosen_span_id = last_error_json["chosen_span_id"];
      if (chosen_span_id==="-1") {
        chosen_span_id = Object.keys(gold_mentions["span_indicating_tkns"]).filter((key) => {return string_to_span(gold_mentions["span_indicating_tkns"][key]).includes(last_error_json["highlighted_tkn_ids"][0])})    
      }


      const correct_span = gold_mentions[error_type][chosen_span_id]["text"]
      if (correct_span==="None") {
        // g_setAnswerWordsToGlow({"type":"unalignable-adujst-summary", "ids":[], "start_tkn":""})
        // g_setGuiderMsg({"type":"reveal-answer", "where":"summary", "text":"Leave out \"from countries like Brazil\"."})
        setSummaryJson(summary_json.map((word) => {return ["from", "countries", "like", "Brazil", "."].includes(word.word) ? {...word, span_highlighted:false} : word}))
        if (parseInt(chosen_span_id)<10) {
          setCurrAlignmentGuidingMsgId((parseInt(chosen_span_id)+1).toString()) // usually the version without "from countries like Brazil" is the next one
          g_setGuiderMsg({"type":"info", "where":"doc", "text":`${guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][parseInt(chosen_span_id)+1]["text"]} <br/><u>Notice</u> that \"from countries like Brazil\" was un-highlighted in the summary (it is not mentioned in the document).`})
        }
        return "<div>\"from countries like Brazil\" doesn't appear in the document. <br/>Therefore, it shouldn't be included in the alignment (I took the courtsey to un-highlight it for you)."
      }
      const where_to_highlight = (error_type==="summary_span") ? "summary":"document"
      const what_is_correct = (correct_span==="") ? "The summary span is unalignable" : `<u>The correct span(s) is</u>: ${correct_span} (see glowing)`
      const what_to_do = (correct_span==="") ? `<b>highlight nothing</b> in the <b>${where_to_highlight}</b>` : `<b>highlight it</b> in the <b><u>${where_to_highlight}</u></b>`
      const what_next = (error_type==="summary_span") ? "then proceed to find its alignment in the <u>document</u>": `<b>hit \"${(StateMachineState==="ANNOTATION") ? "CONFIRM":""}${(StateMachineState==="SENTENCE END") ? "NEXT SENTENCE":""}${(StateMachineState==="SUMMARY END") ? "SUBMIT":""}${(correct_span==="")? " (NO ALIGN)":""}\"</b>`;

      const tkns_type = (error_type==="summary_span") ? 'summary_tkns':'doc_tkns'
      const answerMarker = (gold_mentions[tkns_type][chosen_span_id].length===0) ? {"type":"unalignable-adujst-doc", "ids":[], "start_tkn":""} : {"type":error_type, "ids":gold_mentions[tkns_type][chosen_span_id], "start_tkn":gold_mentions["start_tkn"]}      
      g_setAnswerWordsToGlow(answerMarker)

      if (gold_mentions[tkns_type][chosen_span_id].length===0) {
        setDocJson(doc_json.map((word) => {return {...word, span_highlighted:false}}))
        // g_setGuiderMsg({"type":"reveal-answer", "where":"doc", "text":`Un-highlight everything in the summary and ${what_next}`})
      } else if (error_type==="summary_span") {
        // g_setGuiderMsg({"type":"reveal-answer", "where":"summary", "text":`Highlight <b>only</b> what is <b>glowing</b> and ${what_next}`})
        setSummaryJson(summary_json.map((word) => {return string_to_span(answerMarker["ids"]).includes(word.tkn_id) ? {...word, span_highlighted:true} : {...word, span_highlighted:false}}))
        setCurrAlignmentGuidingMsgId(chosen_span_id)
        g_setGuiderMsg({"type":"info", "where":"doc", "text":guided_annotation_info_messages["custom_messages"][CurrSentInd]["find_alignment"][chosen_span_id]["text"]})
      } else {
        // g_setGuiderMsg({"type":"reveal-answer", "where":"doc", "text":`Highlight <b>only</b> what is <b>glowing</b> and ${what_next}`})
        setDocJson(doc_json.map((word) => {return string_to_span(answerMarker["ids"]).includes(word.tkn_id) ? {...word, span_highlighted:true} : {...word, span_highlighted:false}}))
      }
      return `It appears you are struggling a little, so let me help you. <br/>${what_is_correct}. <hr/>Please ${what_to_do} and ${what_next}.`
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
    // console.log("guided_annotation_messages:")
    // console.log(guided_annotation_messages);
    SetSummaryShadowAndUpdateHighlights(CurrSentInd);
  }, [CurrSentInd]);
  /********************************************************************************/

  /***************************** bolding controlling *****************************/ 
  useEffect(() => {
    // when choosing a span - if nothing is span_highlighted then all sent matches are in bold, otherwise only span_highlighted matches (when highlighting - something must be span-highlighted so automatically is '2')
    if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState) && !sliderBoldStateActivated) {
      boldStateHandler(undefined, true);
    } else if (["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState) && !sliderBoldStateActivated) {
      boldStateHandler(undefined, false);
    }
  }, [StateMachineState, CurrSentInd, AlignmentCount, summary_json]);
  /********************************************************************************/

   /***************************** old alignments controlling *****************************/ 
   const prevState = useRef("")
   useEffect(() => {
     if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState)) {
       oldAlignmentStateHandler({event:undefined, newValue:'2', sent_ind:-1});
     } else if (StateMachineState === "REVISE CLICKED"){
       oldAlignmentStateHandler({event:undefined, newValue:'1', sent_ind:-1});
     } else if (StateMachineState === "REVISE HOVER"){
       oldAlignmentStateHandler({event:undefined, newValue:'2', sent_ind:-1});
     }
     prevState.current = StateMachineState;
   }, [StateMachineState, AlignmentCount]);
   /********************************************************************************/
  //  useEffect(() => {
  //    console.log(`CurrSentInd is updated and is now ${CurrSentInd}`)
  //   //  console.log(`AVIVSL: wanted words are:${JSON.stringify(doc_json.filter((word)=> { return ["came", "come"].includes(word.word)}).map((word) => word.tkn_id))}`)
  //  }, [CurrSentInd]);

   useEffect(() => {
    console.log(`tkn_id of highlighted summary words: ${JSON.stringify(summary_json.filter((word)=>{return word.span_highlighted}).map((word) => word.tkn_id))}`)
  }, [summary_json]);

  useEffect(() => {
    console.log(`tkn_id of highlighted doc words: ${JSON.stringify(doc_json.filter((word)=>{return word.span_highlighted}).map((word) => word.tkn_id))}`)
  }, [doc_json]);


  // useEffect(() => {
  //   console.log(`g_guided_annotation_history: ${JSON.stringify(g_guided_annotation_history)}`)
  // }, [g_guided_annotation_history]);
  // useEffect(() => {
  //   console.log(`guided_annotation_hints here: ${JSON.stringify(guided_annotation_hints)}`)
  // }, []);

   
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




   // solve if too many errors in a row
   useEffect(() => {
    if(guiding_msg_type==="danger") {
      if(g_strikes_counter>=MAX_ERR_CNT) {
        const last_error_json = g_guided_annotation_history.at(-1)
        g_setStrikesCounter(0)
        g_setGuidedAnnotationHistory(g_guided_annotation_history.concat(["strike!"]))
        g_setAnswerModalMsg(getAnswerModalMsg(last_error_json))
      } else {
        g_setStrikesCounter(g_strikes_counter+1)
      }
      // g_guided_annotation_history, g_setGuidedAnnotationHistory,
      // g_open_answer_model, g_setAnswerModalMsg
      // g_strikes_counter, g_setStrikesCounter
    } else if (guiding_msg_type==="success") {
      g_setStrikesCounter(0)

      // g_setAnswerWordsToGlow({"type":"", "ids":[], "start_tkn":""})

    }
   }, [guiding_msg_type])




   // reset Hint's attributes
   useEffect(() => {
    if(!g_show_hint) {
      g_setOpenHint(false)
      g_setWithGlowHint(false)
    }
   }, [g_show_hint])

  // reset Hint's attributes when hint changes
  useEffect(() => {
      g_setOpenHint(false)
      g_setWithGlowHint(false)
    }, [g_hint_msg])

  // if alignment is ok - press the "CONFIRM" or equivalent button to continue
  useEffect(() => {
    if (is_good_alignment) {
      let next_step = "continue"
      // next_step = (StateMachineState === "SENTENCE END") ? "proceed to the next sentence" : next_step
      // next_step = (StateMachineState === "SUMMARY END") ? "submit and finish your training" : next_step
      if(doc_json.filter((word) => {return word.span_highlighted}).length!==0) {
        g_setGuiderMsg({"type":"info", "where":"next-button", "text":`Great job! Now add the alignment.`})
      }
    }
  }, [is_good_alignment])


    

   


   // check if alignment ok (for guidinbg annotation message)
   useEffect(() => {
     if(CurrSentInd>=0 && curr_alignment_guiding_msg_id!=="-1") {
      const isAlignmentOkDict = isAlignmentOk(doc_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id), false, false)
      const isSummarySpanOkDict = isSummarySpanOk(summary_json.filter((word) => {return word.span_highlighted}).map((word) => word.tkn_id), false, false) // if changes summary span after was approved
      setIsGoodAlignment(isAlignmentOkDict["alignment_ok"] && isSummarySpanOkDict["summary_span_ok"])
     }
   }, [doc_json, summary_json])

   // when entering revision mode - scroll up to see the instruction
   useEffect(() => {
    if(StateMachineState==="REVISE HOVER") {
      window.scrollTo(0, 0);
    }
  }, [StateMachineState])



   const SubmitHandler = (event) => {

    setCompleted(true)
    setOpeningModalShow(false)
    setFinishedModalShow(true)
    resetGuidedAnnotation()
    setGuidedUnhighlight(false)
    MachineStateHandlerWrapper()
    window.scrollTo(0, 0)
    // alert("Submitted!");
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
              hoverActivatedId = {hoverActivatedId}
              t_StateMachineStateId = {undefined}                          t_SetStateMachineStateId = {undefined}
              t_start_doc_json = {undefined}                               t_middle_doc_json = {undefined}
              t_sent_end_doc_json = {undefined}                            t_submit_doc_json = {undefined}
              t_start_summary_json = {undefined}                           t_middle_summary_json = {undefined}
              t_sent_end_summary_json = {undefined}                        t_submit_summary_json = {undefined}
              t_state_messages = {undefined}
              g_guiding_info_msg = {guiding_info_msg}                      g_is_good_alignment = {is_good_alignment}
              g_show_hint = {g_show_hint}                                  g_setShowHint = {g_setShowHint}
              g_hint_msg = {g_hint_msg}                                    g_showWhereNavbar = {showWhereNavbar}
              g_open_hint={g_open_hint}                                    g_setOpenHint={g_setOpenHint}
              g_with_glow_hint={g_with_glow_hint}                          g_setWithGlowHint={g_setWithGlowHint}
              g_answer_words_to_glow={g_answer_words_to_glow}              g_FinishedModalShow={FinishedModalShow}
              g_Guider_msg={g_Guider_msg}                                  g_setGuiderMsg={g_setGuiderMsg}
              
              OpeningModalShow = {undefined}                               setOpeningModalShow = {undefined}
              noAlignModalShow = {noAlignModalShow}                        setNoAlignModalShow = {setNoAlignModalShow}
              noAlignApproved = {noAlignApproved}                          setNoAlignApproved = {setNoAlignApproved}
              changeSummarySentHandler = {changeSummarySentHandler}
              showAlert={showAlert}                                       setShowAlert={setShowAlert}
              SubmitModalShow={SubmitModalShow}                           setSubmitModalShow={setSubmitModalShow}
              g_answer_modal_msg={g_answer_modal_msg}
            />

                <Alert show={guiding_msg_type==="success" && g_answer_modal_msg===""} style={{position:"fixed", bottom:"1%", left:"50%", transform:"translate(-50%, 0%)", width:"50%", zIndex:"10000"}} variant={guiding_msg_type} onClose={() => setGuidingMsgType("closed")} dismissible>
                        <Alert.Heading>{guiding_msg["title"]}</Alert.Heading>
                        <p>
                          <Markup content={guiding_msg["text"]} />
                          {guiding_msg["with hint"] && (<div><Button variant="link" onClick={OpenHint}>hint</Button></div>)}
                          <Markup content={add_text_to_GuidedAnnotationInfoAlert(is_good_alignment,StateMachineState, doc_json)} />
                        </p>
                </Alert>

                <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={FinishedModalShow} onHide={() => {setFinishedModalShow(false)}}>
                  <Modal.Header closeButton>
                    <Modal.Title>{guided_annotation_messages["submitted_msg"]['title']}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {<Markup content={guided_annotation_messages["submitted_msg"]["text"]} />}
                  </Modal.Body>
                  <Modal.Footer className='FinishedModalFooter'>
                        <Button active variant="btn btn-warning btn-lg left-button" onClick={() => {setShowWhereNavbar(!showWhereNavbar)}}>
                            SHOW NAVIGATION BAR
                        </Button>


                    <Button variant="btn btn-secondary btn-lg right-button" onClick={() => {setFinishedModalShow(false)}}>
                      REDO
                    </Button>
                    <Link to="/">
                      <Button className="btn btn-success btn-lg right-button">
                        ANNOTATION
                      </Button>
                    </Link>
                  </Modal.Footer>
                </Modal>


                <Modal
                  show={g_answer_modal_msg!==""}
                  backdrop="static"
                  keyboard={false}
                  className="answer-modal-textbox"
                  style={{zIndex:"10000"}}
                >
                  <Modal.Header>
                    <Modal.Title>UH-OH</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {<Markup content={g_answer_modal_msg} />}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={() => {g_setAnswerModalMsg("")}}>
                      GOT IT
                    </Button>
                  </Modal.Footer>
                </Modal>




      </>
   )

}

export default GuidedAnnotation
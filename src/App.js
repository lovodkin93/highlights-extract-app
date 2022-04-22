import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';

import StartPage from './components/StartPage';
import Tutorial from './components/Tutorial';
// import Instructions from './components/Instructions';
import GuidedAnnotation from './components/GuidedAnnotation';

import Annotation from './components/Annotation';
import json_file from './data/data_for_mturk.json';
import g_json_file from './data/guided_annotation/data_for_mturk.json';



import t_start_json_file from './data/tutorial/tutorial_start.json';
import t_middle_json_file from './data/tutorial/tutorial_middle.json';
import t_sent_end_json_file from './data/tutorial/tutorial_sent_end.json';
import t_submit_json_file from './data/tutorial/tutorial_submit.json';




import guided_annotation_messages from './data/guided_annotation/guided_annotation_messages.json'
import guided_annotation_hints from './data/guided_annotation/guided_annotation_hints.json'
import guided_annotation_info_messages from './data/guided_annotation/guided_annotation_info_messages.json'
import guided_annotation_strike_messages from './data/guided_annotation/guided_annotation_strike_messages.json'

import tutorial_state_messages from './data/tutorial/tutorial_state_messages.json'
// import tutorial_state_messages from './data/guided_annotation/guided_annotation_messages.json'



import { MachineStateHandler, g_MachineStateHandler } from './components/Annotation_event_handlers';
import { turkGetAssignmentId, turkGetSubmitToHost, handleSubmit } from './components/mturk_utils'
import _ from 'underscore';
import AWS from 'aws-sdk';

const App = () => {

  // AVIVSL: TUTORIAL_ANNOTATION
  const [t_doc_json, t_setDocJson] = useState([]);
  const [t_summary_json, t_setSummaryJson] = useState([]); 
  const [t_start_doc_json, t_setStartDocJson] = useState([]);
  const [t_start_summary_json, t_setStartSummaryJson] = useState([]); 
  const [t_middle_doc_json, t_setMiddleDocJson] = useState([]);
  const [t_middle_summary_json, t_setMiddleSummaryJson] = useState([]); 
  const [t_sent_end_doc_json, t_setSentEndDocJson] = useState([]);
  const [t_sent_end_summary_json, t_setSentEndSummaryJson] = useState([]); 
  const [t_submit_doc_json, t_setSubmitDocJson] = useState([]);
  const [t_submit_summary_json, t_setSubmitSummaryJson] = useState([]); 
  
  const [t_all_lemma_match_mtx, t_setAllLemmaMtx] = useState([]);
  const [t_important_lemma_match_mtx, t_setImportantLemmaMtx] = useState([]);
  const [t_doc_paragraph_breaks, t_setDocParagraphBreaks] = useState([]);
  const [t_state_messages, t_setStateMessages] = useState([]);

  
  // AVIVSL: GUIDED_ANNOTATION
  const [g_doc_json, g_setDocJson] = useState([]);
  const [g_summary_json, g_setSummaryJson] = useState([]); 
  const [g_all_lemma_match_mtx, g_setAllLemmaMtx] = useState([]);
  const [g_important_lemma_match_mtx, g_setImportantLemmaMtx] = useState([]);
  const [g_doc_paragraph_breaks, g_setDocParagraphBreaks] = useState([]);
  const [g_boldState, g_setBoldState] = useState("sent"); // for user to choose if want full sentence, span or no lemma matching (denoted as "sent", "span" and "none", accordingly)
  const [g_oldAlignmentState, g_setOldAlignmentState] = useState("all"); // for user to choose if want full highlighting history, only current sentence's highlighting history or no history (denoted as "all", "sent" and "none", accordingly)
  const [g_StateMachineState, g_SetStateMachineState] = useState("START");
  const [g_error_message, g_setErrorMessage] = React.useState("");
  const [g_CurrSentInd, g_SetCurrSentInd] = useState(-1);
  const [g_InfoMessage, g_SetInfoMessage] = useState("");
  const [g_AlignmentCount, g_SetAlignmentCount] = useState(0)
  const [g_prevStateMachineState, g_setPrevStateMachineState] = useState("")
  
  const [g_prevSummarySpanHighlights, g_setPrevSummarySpanHighlights] = useState([]) // relevant for restoring span alignments before going to "revise" mode
  const [g_prevDocSpanHighlights, g_setPrevDocSpanHighlights] = useState([]) // relevant for restoring span alignments before going to "revise" mode
  const [g_prevSummaryJsonRevise, g_setPrevSummaryJsonRevise] = useState([]) // relevant for restoring All alignments before choosing an alignment in revise mode so can be restored if pressing the back button
  const [g_prevDocJsonRevise, g_setPrevDocJsonRevise] = useState([]) // relevant for restoring All alignments before choosing an alignment in revise mode so can be restored if pressing the back button
  const [g_prevCurrSentInd, g_setPrevCurrSentInd] = useState(-1) // relevant for restoring previous current sentence


  const [g_DocOnMouseDownID, g_SetDocOnMouseDownID] = useState("-1");
  const [g_SummaryOnMouseDownID, g_SetSummaryOnMouseDownID] = useState("-1");
  const [g_docOnMouseDownActivated, g_setDocOnMouseDownActivated] = useState(false);
  const [g_summaryOnMouseDownActivated, g_setSummaryOnMouseDownActivated] = useState(false);
  const [g_hoverActivatedId, g_setHoverActivatedId] = useState("-1"); // value will be of tkn_id of elem hovered over
  const [g_hoverActivatedDocOrSummary, g_setHoverActivatedDocOrSummary] = useState("doc"); // value will be of tkn_id of elem hovered over
  const [g_sliderBoldStateActivated, g_setSliderBoldStateActivated] = useState(false);


  const [g_guiding_msg, g_setGuidingMsg] = useState({"text":"", "title":""});
  const [g_guiding_msg_type, g_setGuidingMsgType] = useState("closed"); // success , danger or closed
  const [g_curr_alignment_guiding_msg_id, g_setCurrAlignmentGuidingMsgId] = useState("-1")
  const [g_prev_curr_alignment_guiding_msg_id, g_setPrevCurrAlignmentGuidingMsgId] = useState("-1") // relevant for restoring previous current sentence
  const [g_guiding_info_msg, g_setGuidingInfoMsg] = useState({"text":"To begin, hit the \"START\" button.", "title":"Start"}); // the info message that describes what to do
  const [g_prev_guiding_info_msg, g_setPrevGuidingInfoMsg] = useState({"text":"To begin, hit the \"START\" button.", "title":"Start"}); // the info message that describes what to do
  const [g_guided_unhighlight, g_setGuidedUnhighlight] = useState(false)
  const [g_is_good_alignment, g_setIsGoodAlignment] = useState(false)
  const [g_show_hint, g_setShowHint] = useState(false)
  const [g_hint_msg, g_setHintMsg] = useState({"text":"", "title":""})

  const [g_noAlignModalShow, g_setNoAlignModalShow] = useState(false)
  const [g_noAlignApproved, g_setNoAlignApproved] = useState(false)
  
  const [g_completed, g_setCompleted] = useState(false)
  const [g_guided_annotation_history, g_setGuidedAnnotationHistory] = useState([])
  const [g_strikes_counter, g_setStrikesCounter] = useState(0)
  const [g_answer_modal_msg, g_setAnswerModalMsg] = useState("")
  const [g_answer_words_to_glow, g_setAnswerWordsToGlow] = useState({"type":"", "ids":[], "start_tkn":""})
  const [g_Guider_msg, g_setGuiderMsg] = useState({"type":"info", "where":"next-button", "text":"Press me to begin."}) // type: one of {"info", "reveal-answer"}, "where": one of {"doc", "summary", "next-button"}

  // const [guidingAnnotationAlertText, setGuidingAnnotationAlertText] = useState("")
  // const [guidingAnnotationAlertTitle, setGuidingAnnotationAlertTitle] = useState("")
  // const [guidingAnnotationAlertType, setGuidingAnnotationAlertType] = useState("success") // can be either "success" or "danger"
  // const [guidingAnnotationAlertShow, setGuidingAnnotationAlertShow] = useState(true)


  // AVIVSL: ACTUAL ANNOTATION
  const [task_id, setTaskID] = useState("-1"); // default for task_id is -1
  const [doc_json, setDocJson] = useState([]);
  const [summary_json, setSummaryJson] = useState([]); 
  const [all_lemma_match_mtx, setAllLemmaMtx] = useState([]);
  const [important_lemma_match_mtx, setImportantLemmaMtx] = useState([]);
  const [doc_paragraph_breaks, setDocParagraphBreaks] = useState([]);
  const [boldState, setBoldState] = useState("sent"); // for user to choose if want full sentence, span or no lemma matching (denoted as "sent", "span" and "none", accordingly)
  const [oldAlignmentState, setOldAlignmentState] = useState("all"); // for user to choose if want full highlighting history, only current sentence's highlighting history or no history (denoted as "all", "sent" and "none", accordingly)
  const [StateMachineState, SetStateMachineState] = useState("START");
  const [error_message, setErrorMessage] = React.useState("");
  const [CurrSentInd, SetCurrSentInd] = useState(-1);
  const [InfoMessage, SetInfoMessage] = useState("");
  const [AlignmentCount, SetAlignmentCount] = useState(0)

  const [prevStateMachineState, setPrevStateMachineState] = useState("")
  
  const [prevSummarySpanHighlights, setPrevSummarySpanHighlights] = useState([]) // relevant for restoring span alignments before going to "revise" mode
  const [prevDocSpanHighlights, setPrevDocSpanHighlights] = useState([]) // relevant for restoring span alignments before going to "revise" mode
  const [prevSummaryJsonRevise, setPrevSummaryJsonRevise] = useState([]) // relevant for restoring All alignments before choosing an alignment in revise mode so can be restored if pressing the back button
  const [prevDocJsonRevise, setPrevDocJsonRevise] = useState([]) // relevant for restoring All alignments before choosing an alignment in revise mode so can be restored if pressing the back button
  const [prevCurrSentInd, setPrevCurrSentInd] = useState(-1) // relevant for restoring previous current sentence


  const [DocOnMouseDownID, SetDocOnMouseDownID] = useState("-1");
  const [SummaryOnMouseDownID, SetSummaryOnMouseDownID] = useState("-1");
  const [docOnMouseDownActivated, setDocOnMouseDownActivated] = useState(false);
  const [summaryOnMouseDownActivated, setSummaryOnMouseDownActivated] = useState(false);
  const [hoverActivatedId, setHoverActivatedId] = useState("-1"); // value will be of tkn_id of elem hovered over
  const [hoverActivatedDocOrSummary, setHoverActivatedDocOrSummary] = useState("doc"); // value will be of tkn_id of elem hovered over
  
  const [sliderBoldStateActivated, setSliderBoldStateActivated] = useState(false);
  const [noAlignModalShow, setNoAlignModalShow] = useState(false)
  const [noAlignApproved, setNoAlignApproved] = useState(false)


  //mturk
  const [assignmentId, SetAssignmentId] = useState("")
  const [turkSubmitTo, SetMturkTurkSubmitTo] = useState("https://www.mturk.com")
  const [isFinished, SetIsFinished] = useState(false)
  const [OpeningModalShow, setOpeningModalShow] = useState(true);








  /*************************************** error handling *************************************************/
  const Alert = React.forwardRef(function Alert(props, ref) {return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;});
  
  // AVIVSL: GUIDED_ANNOTATION
  const g_handleErrorOpen = ({ msg }) => { 
    g_setErrorMessage(msg); 
  };

  const g_handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    g_setErrorMessage("");
  };

  // AVIVSL: ACTUAL ANNOTATION
  const handleErrorOpen = ({ msg }) => { 
    setErrorMessage(msg); 
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage("");
  };


/************************************************************************************************************* */

  const isPunct = (tkn_txt) => {
    const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    const result = tkn_txt.replace(regex, '').replace(/(\r\n|\n|\r)/gm, "");
    return (result === '');
  }

// AVIVSL: GUIDED_ANNOTATION  
  function g_addDocWordComponents(doc) {
    let updated_doc_json = [];
    doc.forEach((word) => {
      let boldfaced=false;
      let all_highlighted=false; // all the doc's highlights so far
      let span_highlighted=false; // all the span's highlights so far
      let old_alignments=false; // old highlighting control (goes between all, sentences and none) --> how much of all_highlighted to highlight
      let alignment_id=[];
      let old_alignment_hover=false; // to pop when hovering over words during "REVISE HOVER" state
      let span_alignment_hover=false; // to ease the process of choosing spans (while pressing the mouse - make simultaneous highlighting)
      let red_color=false;
      const newWord = {...word, boldfaced, span_highlighted, all_highlighted, old_alignments, old_alignment_hover, span_alignment_hover, red_color, alignment_id}; 
      updated_doc_json = [...updated_doc_json, newWord];
    })
    g_setDocJson(updated_doc_json);
  }

  function g_addSummaryWordComponents(summary) {
    let updated_summary_json = [];
    summary.forEach((word) => {
      let boldfaced=false;

      let all_highlighted=false; // all the doc's highlights so far
      let span_highlighted=false; // all the span's highlights so far
      let old_alignments=false; // old highlighting control (goes between all, sentences and none) --> how much of all_highlighted to highlight
      let shadowed=false;
      let alignment_id=[];
      let old_alignment_hover=false; // to pop when hovering over words during "REVISE HOVER" state
      let span_alignment_hover=false; // to ease the process of choosing spans (while pressing the mouse - make simultaneous highlighting)
      const newWord = {...word, boldfaced, span_highlighted, all_highlighted, old_alignments, old_alignment_hover, span_alignment_hover, shadowed, alignment_id}; 
      updated_summary_json = [...updated_summary_json, newWord];
    })
    g_setSummaryJson(updated_summary_json);
  }


// AVIVSL: ACTUAL ANNOTATION
  function addDocWordComponents(doc) {
    let updated_doc_json = [];
    doc.forEach((word) => {
      let boldfaced=false;
      let all_highlighted=false; // all the doc's highlights so far
      let span_highlighted=false; // all the span's highlights so far
      let old_alignments=false; // old highlighting control (goes between all, sentences and none) --> how much of all_highlighted to highlight
      let alignment_id=[];
      let old_alignment_hover=false; // to pop when hovering over words during "REVISE HOVER" state
      let span_alignment_hover=false; // to ease the process of choosing spans (while pressing the mouse - make simultaneous highlighting)
      let red_color=false;
      const newWord = {...word, boldfaced, span_highlighted, all_highlighted, old_alignments, old_alignment_hover, span_alignment_hover, red_color, alignment_id}; 
      updated_doc_json = [...updated_doc_json, newWord];
    })
    setDocJson(updated_doc_json);
  }


  function addSummaryWordComponents(summary) {
    let updated_summary_json = [];
    summary.forEach((word) => {
      let boldfaced=false;

      let all_highlighted=false; // all the doc's highlights so far
      let span_highlighted=false; // all the span's highlights so far
      let old_alignments=false; // old highlighting control (goes between all, sentences and none) --> how much of all_highlighted to highlight
      let shadowed=false;
      let alignment_id=[];
      let old_alignment_hover=false; // to pop when hovering over words during "REVISE HOVER" state
      let span_alignment_hover=false; // to ease the process of choosing spans (while pressing the mouse - make simultaneous highlighting)
      const newWord = {...word, boldfaced, span_highlighted, all_highlighted, old_alignments, old_alignment_hover, span_alignment_hover, shadowed, alignment_id}; 
      updated_summary_json = [...updated_summary_json, newWord];
    })
    setSummaryJson(updated_summary_json);
  }

  const toggleDocSpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
    setSliderBoldStateActivated(false)
    if (turn_on){
      setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word))
    } else if (turn_off){
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false, span_alignment_hover:false } : word))
    } else {
        setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word))
    }
  }

  toggleDocSpanHighlight.defaultProps = {
    turn_on: false,
    turn_off: false
  }

  const toggleSummarySpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
    // console.log("inside toggleSummarySpanHighlight:")
    // console.log(tkn_ids)
    setSliderBoldStateActivated(false)
    if (turn_on){
      setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word));
    } else if (turn_off){
      setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false, span_alignment_hover:false } : word));
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
      const current_sentence_id = CurrSentInd

      setPrevStateMachineState(StateMachineState);
      setPrevDocSpanHighlights(doc_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
      setPrevSummarySpanHighlights(summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
      setPrevCurrSentInd(current_sentence_id)
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
    // if (isHover){
    //   console.log("AVIVSL: summary_ids are:")
    //   console.log(summary_ids)
    // }
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
    // onMouseEnter for all the alignments choosing states
    // else if (inOrOut === "in" && ["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState) && isSummary) { 
      // const doc_tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id:doc_id, summary_ids:[tkn_id], isHover:true})});
      // setDocJson(doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? {...word, red_color:true} : {...word, red_color:false}))
    // } 
    // onMouseLeave for all the alignments choosing states
    else if (inOrOut === "out" && ["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState) && isSummary) { 
      setDocJson(doc_json.map((word) => {return {...word, red_color:false}}))
    }

  }

  const isRedLettered = (summary_tkn_id) => {
    if ((summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && StateMachineState !== "REVISE HOVER") {
      return false
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      return true
    }

  }



  const MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
    

    // no alignment
    if ((typeof forceState !== 'string') && (StateMachineState !== "REVISE HOVER") && (doc_json.filter((word) => {return word.span_highlighted}).length === 0) && (StateMachineState!=="START") && !noAlignApproved) {
      setNoAlignModalShow(true)
      return
    }
    setNoAlignApproved(false)


    setSliderBoldStateActivated(false);
    if (typeof forceState === 'string') {
      console.log(`forceState situation with: state ${forceState}`);
    }
    else{
      console.log("not a forceState situation...");
    }
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
                          setPrevSummaryJsonRevise, setPrevDocJsonRevise
                         );
  }

  MachineStateHandlerWrapper.defaultProps = {
    forceState: '',
    clickedWordInfo: [],
    isBackBtn: false
  }

/**************************************************************************************************************/

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
      // console.log(`curr state is ${StateMachineState}`);
      // console.log(`curr CurrSentInd is ${CurrSentInd}`)
      // console.log("back to square one");
      finishedSent.current = false;
      MachineStateHandlerWrapper({forceState:"ANNOTATION"});
    }
  }, [summary_json]);
  /*********************************************************************************/ 


  
  /*********** useState to update the summary shadow when next sentence ***********/ 
  useEffect(() => {
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
    useEffect(() => {
      // console.log(`CurrSentInd is updated and is now ${CurrSentInd}`)
      // console.log('doc_json:')
      // console.log(doc_json)
      // console.log('t_doc_json:')
      // console.log(t_doc_json)
    }, [CurrSentInd]);
    
    
    
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
      console.log(`hoverActivatedId:${hoverActivatedId}`)
      if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)){
        if(docOnMouseDownActivated) {
          // console.log(`DocOnMouseDownID is ${DocOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
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
          // console.log(`SummaryOnMouseDownID is ${SummaryOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
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
            
            console.log("red is activated:")
            console.log(doc_json.filter((word) => {return doc_tkn_ids.includes(word.tkn_id)}).map((word) => {return word.word}))

            setDocJson(doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? {...word, red_color:true} : {...word, red_color:false}))  
          } 
        }
      }
    }, [docOnMouseDownActivated, summaryOnMouseDownActivated, hoverActivatedId]);


    /********************************************************************************/
    
    








    
/**************************************************************************************************************/

    const g_resetGuidedAnnotation = () => {
      const curr_id = '0';

      g_addDocWordComponents(g_json_file[curr_id]["doc"]);
      g_addSummaryWordComponents(g_json_file[curr_id]["summary"]);
      g_setAllLemmaMtx(g_json_file[curr_id]["all_lemma_match_mtx"]);
      g_setImportantLemmaMtx(g_json_file[curr_id]["important_lemma_match_mtx"]);
      g_setDocParagraphBreaks(g_json_file[curr_id]["doc_paragraph_breaks"]);
      g_SetStateMachineState("START")
      g_SetCurrSentInd(-1)
      g_SetAlignmentCount(0)
      g_setPrevStateMachineState("")
      g_setIsGoodAlignment(false)
      g_setGuidingInfoMsg({"text":"To begin, hit the \"START\" button.", "title":"Start"})
      g_setGuiderMsg({"type":"info", "where":"next-button", "text":"Press me to begin."}) 

    }

    useEffect(() => {

      const t_addWordComponents = (setJson, input_json) => {
        let new_json = [];
        input_json.forEach((word) => {new_json = [...new_json, word];})
        setJson(new_json)
      }


      const t_getTasks = () => {
      


        // get doc_jsons
        t_addWordComponents(t_setDocJson, t_start_json_file["doc"])
        t_addWordComponents(t_setStartDocJson, t_start_json_file["doc"])
        t_addWordComponents(t_setMiddleDocJson, t_middle_json_file["doc"])
        t_addWordComponents(t_setSentEndDocJson, t_sent_end_json_file["doc"])
        t_addWordComponents(t_setSubmitDocJson, t_submit_json_file["doc"])
        // get summary_jsons
        t_addWordComponents(t_setSummaryJson, t_start_json_file["summary"])
        t_addWordComponents(t_setStartSummaryJson, t_start_json_file["summary"])
        t_addWordComponents(t_setMiddleSummaryJson, t_middle_json_file["summary"])
        t_addWordComponents(t_setSentEndSummaryJson, t_sent_end_json_file["summary"])
        t_addWordComponents(t_setSubmitSummaryJson, t_submit_json_file["summary"])



        // get all the matrices and the paragraph breaks
        t_setAllLemmaMtx(t_start_json_file["all_lemma_match_mtx"]);
        t_setImportantLemmaMtx(t_start_json_file["important_lemma_match_mtx"]);
        t_setDocParagraphBreaks(t_start_json_file["doc_paragraph_breaks"])
        
        
        // get state messages
        t_setStateMessages(tutorial_state_messages)


        fetch(`/`).then(
          res => console.log(res)
        )
      }





      const g_getTasks = () => {
        g_resetGuidedAnnotation()

        fetch(`/`).then(
          res => console.log(res)
        )
          
        }
    


      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const curr_id = urlParams.get('id');

        const assignment_id = turkGetAssignmentId();
        const turk_submit_to = turkGetSubmitToHost();

        SetAssignmentId(assignment_id)
        SetMturkTurkSubmitTo(turk_submit_to)
        setTaskID(curr_id);

        addDocWordComponents(json_file[curr_id]["doc"])
        addSummaryWordComponents(json_file[curr_id]["summary"])
        setAllLemmaMtx(json_file[curr_id]["all_lemma_match_mtx"]);
        setImportantLemmaMtx(json_file[curr_id]["important_lemma_match_mtx"]);
        setDocParagraphBreaks(json_file[curr_id]["doc_paragraph_breaks"])
        fetch(`/`).then(
          res => console.log(res)
        )
          
        }
      t_getTasks();
      g_getTasks();
      getTasks();
    }, [])


    const SubmitHandler = (event) => {
      // no alignment
      if ((typeof forceState !== 'string') && (doc_json.filter((word) => {return word.span_highlighted}).length === 0) && (StateMachineState!=="START") && !noAlignApproved) {
        setNoAlignModalShow(true)
        return
      }
      setNoAlignApproved(false)
      
      
      approveHighlightHandler()
      SetIsFinished(true)

      // console.log(event);
      // alert("Submitted!");
      // handleSubmit(assignmentId, turkSubmitTo, doc_json, summary_json)
    }

    useEffect(() => {
      if (isFinished) {
        handleSubmit(assignmentId, turkSubmitTo, doc_json, summary_json, g_completed, g_guided_annotation_history)
      }
    }, [isFinished]);






    // const g_SubmitHandler = (event) => {
    //   alert("Submitted!");
    // }





    /*********************************** TO SAVE THE JSONS ******************************** */ 
    // function export2txt(words, dir) {
    //   const a = document.createElement("a");
    //   a.href = URL.createObjectURL(new Blob([JSON.stringify(words, null, 2)], {
    //     type: "text/plain"
    //   }));
    //   a.setAttribute("download", dir);
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    // }

    // useEffect(() => {
    //   console.log("saving current values")


    //   export2txt({"doc":doc_json, "summary":summary_json, "all_lemma_match_mtx":all_lemma_match_mtx, "important_lemma_match_mtx":important_lemma_match_mtx, "doc_paragraph_breaks":doc_paragraph_breaks}, "tutorial_half_way_data_for_mturk.json")

    //    // export2txt(doc_json, "doc_json.json")
    //    // export2txt(summary_json, "summary_json.json")
    // }, [StateMachineState]);
    /*************************************************************************************** */



  return (
    <Router>
      <div className='container-background'>
        <Routes>
          {/* <Route path='/' element={<StartPage />} /> */}
          {/* <Route path='/homepage' element={<StartPage />} /> */}
          {/* <Route path='/instructions' element={<Instructions />} /> */}
          <Route path='/tutorial' element=  {<Tutorial doc_json = {t_doc_json} 
                                                       setDocJson = {t_setDocJson}
                                                       t_start_doc_json = {t_start_doc_json} 
                                                       t_middle_doc_json = {t_middle_doc_json}
                                                       t_sent_end_doc_json = {t_sent_end_doc_json}
                                                       t_submit_doc_json = {t_submit_doc_json}
                                                       summary_json = {t_summary_json} 
                                                       setSummaryJson = {t_setSummaryJson}
                                                       t_start_summary_json = {t_start_summary_json}
                                                       t_middle_summary_json = {t_middle_summary_json}
                                                       t_sent_end_summary_json = {t_sent_end_summary_json}
                                                       t_submit_summary_json = {t_submit_summary_json}
                                                       all_lemma_match_mtx = {t_all_lemma_match_mtx} 
                                                       setAllLemmaMtx = {t_setAllLemmaMtx}
                                                       important_lemma_match_mtx = {t_important_lemma_match_mtx} 
                                                       setImportantLemmaMtx = {t_setImportantLemmaMtx}
                                                       doc_paragraph_breaks = {t_doc_paragraph_breaks} 
                                                       setDocParagraphBreaks = {t_setDocParagraphBreaks} 
                                                       t_state_messages = {t_state_messages}
                                              />}
          />

          <Route path='/guidedAnnotation' element={<GuidedAnnotation
                                          isPunct={isPunct} 
                                          handleErrorOpen={g_handleErrorOpen}                                   handleErrorClose={g_handleErrorClose}
                                          doc_json={g_doc_json}                                                 setDocJson={g_setDocJson}
                                          summary_json={g_summary_json}                                         setSummaryJson={g_setSummaryJson}
                                          all_lemma_match_mtx={g_all_lemma_match_mtx}                           setAllLemmaMtx={g_setAllLemmaMtx}
                                          important_lemma_match_mtx={g_important_lemma_match_mtx}               setImportantLemmaMtx={g_setImportantLemmaMtx}
                                          doc_paragraph_breaks={g_doc_paragraph_breaks}                         setDocParagraphBreaks={g_setDocParagraphBreaks}
                                          boldState={g_boldState}                                               setBoldState={g_setBoldState}
                                          oldAlignmentState={g_oldAlignmentState}                               setOldAlignmentState={g_setOldAlignmentState}
                                          StateMachineState={g_StateMachineState}                               SetStateMachineState={g_SetStateMachineState}
                                          error_message={g_error_message}                                       setErrorMessage={g_setErrorMessage}
                                          CurrSentInd={g_CurrSentInd}                                           SetCurrSentInd={g_SetCurrSentInd}
                                          InfoMessage={g_InfoMessage}                                           SetInfoMessage={g_SetInfoMessage}
                                          AlignmentCount={g_AlignmentCount}                                     SetAlignmentCount={g_SetAlignmentCount}
                                          prevStateMachineState={g_prevStateMachineState}                       setPrevStateMachineState={g_setPrevStateMachineState}
                                          prevSummarySpanHighlights={g_prevSummarySpanHighlights}               setPrevSummarySpanHighlights={g_setPrevSummarySpanHighlights}
                                          prevDocSpanHighlights={g_prevDocSpanHighlights}                       setPrevDocSpanHighlights={g_setPrevDocSpanHighlights}
                                          prevSummaryJsonRevise={g_prevSummaryJsonRevise}                       setPrevSummaryJsonRevise={g_setPrevSummaryJsonRevise}
                                          prevDocJsonRevise={g_prevDocJsonRevise}                               setPrevDocJsonRevise={g_setPrevDocJsonRevise}
                                          prevCurrSentInd={g_prevCurrSentInd}                                   setPrevCurrSentInd={g_setPrevCurrSentInd}
                                          
                                          
                                          DocOnMouseDownID={g_DocOnMouseDownID}                                 SetDocOnMouseDownID={g_SetDocOnMouseDownID}
                                          SummaryOnMouseDownID={g_SummaryOnMouseDownID}                         SetSummaryOnMouseDownID={g_SetSummaryOnMouseDownID}
                                          docOnMouseDownActivated={g_docOnMouseDownActivated}                   setDocOnMouseDownActivated={g_setDocOnMouseDownActivated}
                                          summaryOnMouseDownActivated={g_summaryOnMouseDownActivated}           setSummaryOnMouseDownActivated={g_setSummaryOnMouseDownActivated}
                                          hoverActivatedId={g_hoverActivatedId}                                 setHoverActivatedId={g_setHoverActivatedId}
                                          hoverActivatedDocOrSummary={g_hoverActivatedDocOrSummary}             setHoverActivatedDocOrSummary={g_setHoverActivatedDocOrSummary}
                                          sliderBoldStateActivated={g_sliderBoldStateActivated}                 setSliderBoldStateActivated={g_setSliderBoldStateActivated}
                                          guided_annotation_messages={guided_annotation_messages}               guided_annotation_info_messages={guided_annotation_info_messages}
                                          guiding_msg={g_guiding_msg}                                           setGuidingMsg={g_setGuidingMsg}
                                          guiding_msg_type={g_guiding_msg_type}                                 setGuidingMsgType={g_setGuidingMsgType}
                                          curr_alignment_guiding_msg_id={g_curr_alignment_guiding_msg_id}       setCurrAlignmentGuidingMsgId={g_setCurrAlignmentGuidingMsgId}
                                          guiding_info_msg={g_guiding_info_msg}                                 setGuidingInfoMsg={g_setGuidingInfoMsg}
                                          guided_unhighlight={g_guided_unhighlight}                             setGuidedUnhighlight={g_setGuidedUnhighlight}
                                          
                                          
                                          is_good_alignment={g_is_good_alignment}                               setIsGoodAlignment={g_setIsGoodAlignment}
                                          setCompleted={g_setCompleted}                                         resetGuidedAnnotation={g_resetGuidedAnnotation}
                                          g_show_hint={g_show_hint}                                             g_setShowHint={g_setShowHint}
                                          g_hint_msg={g_hint_msg}                                               g_setHintMsg={g_setHintMsg} 
                                          guided_annotation_hints={guided_annotation_hints}                     guided_annotation_strike_messages={guided_annotation_strike_messages}
                                          noAlignModalShow={g_noAlignModalShow}                                 setNoAlignModalShow={g_setNoAlignModalShow}
                                          noAlignApproved={g_noAlignApproved}                                   setNoAlignApproved={g_setNoAlignApproved}
                                          setOpeningModalShow={setOpeningModalShow}
                                          setPrevCurrAlignmentGuidingMsgId={g_setPrevCurrAlignmentGuidingMsgId} prev_curr_alignment_guiding_msg_id={g_prev_curr_alignment_guiding_msg_id} 
                                          setPrevGuidingInfoMsg={g_setPrevGuidingInfoMsg}                       prev_guiding_info_msg={g_prev_guiding_info_msg}
                                          g_guided_annotation_history={g_guided_annotation_history}             g_setGuidedAnnotationHistory={g_setGuidedAnnotationHistory}
                                          g_strikes_counter={g_strikes_counter}                                 g_setStrikesCounter={g_setStrikesCounter}
                                          g_answer_modal_msg={g_answer_modal_msg}                               g_setAnswerModalMsg={g_setAnswerModalMsg} 
                                          g_answer_words_to_glow={g_answer_words_to_glow}                       g_setAnswerWordsToGlow={g_setAnswerWordsToGlow}  
                                          g_Guider_msg={g_Guider_msg}                                           g_setGuiderMsg={g_setGuiderMsg}
                                          />} 
          
          />

          <Route path='/' element={<Annotation 
                                              isTutorial={false}                                          isGuidedAnnotation={false}                                
                                              task_id={task_id}                                           doc_paragraph_breaks={doc_paragraph_breaks}
                                              doc_json={doc_json}                                         setDocJson={setDocJson}                                 
                                              summary_json={summary_json}                                 setSummaryJson={setSummaryJson}
                                              all_lemma_match_mtx={all_lemma_match_mtx}                   important_lemma_match_mtx={important_lemma_match_mtx}   
                                              StateMachineState={StateMachineState}                       SetStateMachineState={SetStateMachineState}
                                              handleErrorOpen={handleErrorOpen}                           isPunct={isPunct}
                                              toggleSummarySpanHighlight={toggleSummarySpanHighlight}     toggleDocSpanHighlight={toggleDocSpanHighlight}
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
                                              t_StateMachineStateId = {undefined}                         t_SetStateMachineStateId = {undefined}
                                              t_start_doc_json = {undefined}                              t_middle_doc_json = {undefined}
                                              t_sent_end_doc_json = {undefined}                           t_submit_doc_json = {undefined}
                                              t_start_summary_json = {undefined}                          t_middle_summary_json = {undefined}
                                              t_sent_end_summary_json = {undefined}                       t_submit_summary_json = {undefined}
                                              t_state_messages = {undefined}
                                              g_guiding_info_msg = {undefined}                            g_is_good_alignment = {undefined}
                                              g_show_hint = {undefined}                                   g_setShowHint = {undefined}
                                              g_hint_msg = {{"text":"", "title":""}}                      g_showWhereNavbar = {undefined}
                                              g_open_hint={undefined}                                     g_setOpenHint={undefined}
                                              g_with_glow_hint={undefined}                                g_setWithGlowHint={undefined}
                                              g_answer_words_to_glow={{"type":"", "ids":[]}}              g_FinishedModalShow={undefined}
                                              g_Guider_msg={{"type":"", "where":"", "text":""}}           g_setGuiderMsg={undefined}
                                              
                                              OpeningModalShow = {OpeningModalShow}                       setOpeningModalShow = {setOpeningModalShow}
                                              noAlignModalShow = {noAlignModalShow}                       setNoAlignModalShow = {setNoAlignModalShow}
                                              noAlignApproved = {noAlignApproved}                         setNoAlignApproved = {setNoAlignApproved}
                                              />} 
            />

        </Routes>
      </div>
      <Snackbar open={error_message !== "" && !OpeningModalShow} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error_message}
        </Alert>
      </Snackbar>
      <Snackbar open={g_error_message !== ""} autoHideDuration={6000} onClose={g_handleErrorClose}>
        <Alert onClose={g_handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {g_error_message}
        </Alert>
      </Snackbar>
    </Router>
  )
}

export default App

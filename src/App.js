import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';

import StartPage from './components/StartPage';
import Tutorial from './components/Tutorial';
import Instructions from './components/Instructions';
import GuidedAnnotation from './components/GuidedAnnotation';

import Annotation from './components/Annotation';
import json_file from './data/data_for_mturk.json';
import g_json_file from './data/guided_annotation/data_for_mturk.json';



import t_start_json_file from './data/tutorial/tutorial_start.json';
import t_middle_json_file from './data/tutorial/tutorial_middle.json';
import t_sent_end_json_file from './data/tutorial/tutorial_sent_end.json';
import t_submit_json_file from './data/tutorial/tutorial_submit.json';




// import guided_annotation_messages from './data/guided_annotation/guided_annotation_messages.json'
import tutorial_state_messages from './data/tutorial/tutorial_state_messages.json'
// import tutorial_state_messages from './data/guided_annotation/guided_annotation_messages.json'



import { MachineStateHandler, g_MachineStateHandler } from './components/Annotation_event_handlers';
import _ from 'underscore';


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


  const [g_DocOnMouseDownID, g_SetDocOnMouseDownID] = useState("-1");
  const [g_SummaryOnMouseDownID, g_SetSummaryOnMouseDownID] = useState("-1");
  const [g_docOnMouseDownActivated, g_setDocOnMouseDownActivated] = useState(false);
  const [g_summaryOnMouseDownActivated, g_setSummaryOnMouseDownActivated] = useState(false);
  const [g_hoverActivatedId, g_setHoverActivatedId] = useState("-1"); // value will be of tkn_id of elem hovered over
  const [g_hoverActivatedDocOrSummary, g_setHoverActivatedDocOrSummary] = useState("doc"); // value will be of tkn_id of elem hovered over
  const [g_sliderBoldStateActivated, g_setSliderBoldStateActivated] = useState(false);

  const [guidingAnnotationAlertText, setGuidingAnnotationAlertText] = useState("")
  const [guidingAnnotationAlertTitle, setGuidingAnnotationAlertTitle] = useState("")
  const [guidingAnnotationAlertType, setGuidingAnnotationAlertType] = useState("success") // can be either "success" or "danger"
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


  const [DocOnMouseDownID, SetDocOnMouseDownID] = useState("-1");
  const [SummaryOnMouseDownID, SetSummaryOnMouseDownID] = useState("-1");
  const [docOnMouseDownActivated, setDocOnMouseDownActivated] = useState(false);
  const [summaryOnMouseDownActivated, setSummaryOnMouseDownActivated] = useState(false);
  const [hoverActivatedId, setHoverActivatedId] = useState("-1"); // value will be of tkn_id of elem hovered over
  const [hoverActivatedDocOrSummary, setHoverActivatedDocOrSummary] = useState("doc"); // value will be of tkn_id of elem hovered over
  const [sliderBoldStateActivated, setSliderBoldStateActivated] = useState(false);

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

  /************************************************************************************************* AVIVSL: GUIDED_ANNOTATION *****************************************************************************************/
  
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

  const g_toggleDocSpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
    g_setSliderBoldStateActivated(false)
    if (turn_on){
      g_setDocJson(g_doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word))
    } else if (turn_off){
        g_setDocJson(g_doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false } : word))
    } else {
      g_setDocJson(g_doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word))
    }
  }

  g_toggleDocSpanHighlight.defaultProps = {
    turn_on: false,
    turn_off: false
  }

  const update_GuidingAnnotationAlertText = ({alert_title, alert_text, alert_type}) => {
    setGuidingAnnotationAlertTitle(alert_title)
    setGuidingAnnotationAlertText(alert_text)
    setGuidingAnnotationAlertType(alert_type)
  }
  
  const closeGuidingAnnotationAlert = () => {
    update_GuidingAnnotationAlertText({alert_title:"", alert_text:"", alert_type:"danger"})
  }



  const g_toggleSummarySpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
    console.log("inside toggleSummarySpanHighlight:")
    console.log(tkn_ids)
    setSliderBoldStateActivated(false)
    if (turn_on){
      g_setSummaryJson(g_summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: true } : word));
    } else if (turn_off){
      g_setSummaryJson(g_summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: false } : word));
    } else {
      g_setSummaryJson(g_summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word));
    }
  }

  g_toggleSummarySpanHighlight.defaultProps = {
    turn_on: false,
    turn_off: false
  }

  const g_approveHighlightHandler = () => {
    const doc_tkn_ids = g_doc_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
    g_setDocJson(g_doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? { ...word, all_highlighted: true, alignment_id: [...word.alignment_id, g_AlignmentCount], span_highlighted: false } : word));


    const summary_tkn_ids = g_summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
    g_setSummaryJson(g_summary_json.map((word) => summary_tkn_ids.includes(word.tkn_id) ? { ...word, all_highlighted: true, alignment_id: [...word.alignment_id, g_AlignmentCount], span_highlighted: false } : word));    
 
  }

  const g_StartReviseStateHandler = (isBackBtn) => {
    if (isBackBtn){
      g_setDocJson(g_doc_json.map((word, ind) => {return {...word, all_highlighted: g_prevDocJsonRevise[ind].all_highlighted, span_highlighted: g_prevDocJsonRevise[ind].span_highlighted, alignment_id: g_prevDocJsonRevise[ind].alignment_id}}))
      g_setSummaryJson(g_summary_json.map((word, ind) => {return {...word, all_highlighted: g_prevSummaryJsonRevise[ind].all_highlighted, span_highlighted: g_prevSummaryJsonRevise[ind].span_highlighted, alignment_id: g_prevSummaryJsonRevise[ind].alignment_id}}))
    } else{
      g_setPrevStateMachineState(g_StateMachineState);
      g_setPrevDocSpanHighlights(g_doc_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
      g_setPrevSummarySpanHighlights(g_summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id}));
      
      g_setDocJson(g_doc_json.map((word) => {return {...word, span_highlighted: false}}))
      g_setSummaryJson(g_summary_json.map((word) => {return {...word, span_highlighted: false}}))
    }
  }

  const g_ExitReviseHandler = () => {
    g_setDocJson(g_doc_json.map((word, ind) => g_prevDocSpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))
    g_setSummaryJson(g_summary_json.map((word, ind) => g_prevSummarySpanHighlights.includes(word.tkn_id) ? {...word, span_highlighted: true}:{...word, span_highlighted: false}))               
    const prev_state = g_prevStateMachineState;
    g_SetStateMachineState(g_prevStateMachineState);
    g_setPrevStateMachineState("");
    g_setPrevSummarySpanHighlights([]);
    g_setPrevDocSpanHighlights([]);
    return prev_state
  }

  const g_RemoveAlignmentId = (word, chosen_align_id) => {
    const new_alignment_id = word.alignment_id.filter((elem) => {return elem !== chosen_align_id});
    return new_alignment_id;
  }

  const g_ReviseChooseAlignHandler = (clickedWordInfo) => {
    g_setPrevSummaryJsonRevise(g_summary_json);
    g_setPrevDocJsonRevise(g_doc_json);

    const chosen_align_id = (clickedWordInfo[0] === 'doc') ? g_doc_json.filter((word) => {return word.tkn_id === clickedWordInfo[1]})[0].alignment_id[0] : 
    g_summary_json.filter((word) => {return word.tkn_id === clickedWordInfo[1]})[0].alignment_id[0]

    g_setSummaryJson(g_summary_json.map((word) => word.alignment_id.includes(chosen_align_id) ? {...word, span_highlighted: true, all_highlighted: false, old_alignments: false, old_alignment_hover:false, alignment_id: g_RemoveAlignmentId(word, chosen_align_id)} : {...word, span_highlighted: false}))
    g_setDocJson(g_doc_json.map((word) => word.alignment_id.includes(chosen_align_id) ? {...word, span_highlighted: true, all_highlighted: false, old_alignments: false, old_alignment_hover:false, alignment_id: g_RemoveAlignmentId(word, chosen_align_id)} : {...word, span_highlighted: false}))
  }


  const g_SetSummaryShadow = (sent_id) => {
    g_setSummaryJson(g_summary_json.map((word) => word.sent_id === sent_id ? { ...word, shadowed: true } : { ...word, shadowed: false }))
  }


  const g_SetSummaryShadowAndUpdateHighlights = (sent_id) => {
    g_setSummaryJson(
      g_summary_json.map((word) => word.sent_id === sent_id ? { ...word, shadowed: true } : { ...word, shadowed: false }).map(
      (word) => word.span_highlighted ? {...word, span_highlighted: false, all_highlighted:true} : word)
      )
  }

  const g_SetDocBoldface = (tkn_ids) => {
    g_setDocJson(g_doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, boldfaced: true } : { ...word, boldfaced: false }))
  }




  const g_checkIfLemmasMatch = ({doc_id, summary_ids, isHover}) => {
    const which_match_mtx = g_important_lemma_match_mtx;
    const matching_summary_ids = summary_ids.filter((summary_id) => {return g_all_lemma_match_mtx[doc_id][summary_id] === 1;})
    return matching_summary_ids.length > 0
  }

  const g_boldStateHandler = (event, newValue) => {
    if (event !== undefined){
      g_setSliderBoldStateActivated(true)
    }
    if (newValue=='1'){
      g_setBoldState("none");
      g_SetDocBoldface([]);
    } else if (newValue=='2'){
      g_setBoldState("span");
      const summary_ids = g_summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
      const isSpan = true;
      const tkn_ids = g_doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return g_checkIfLemmasMatch({doc_id:doc_id, summary_ids:summary_ids, isHover:false})});
      g_SetDocBoldface(tkn_ids);
    } else {
      g_setBoldState("sent");
      const isSpan = false;
      const summary_ids = g_summary_json.filter((word) => {return word.shadowed}).map((word) => {return word.tkn_id});
      const tkn_ids = g_doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return g_checkIfLemmasMatch({doc_id:doc_id, summary_ids:summary_ids, isHover:false})});
      g_SetDocBoldface(tkn_ids);
    }
  }


  const g_SetDocOldHighlights = (tkn_ids) => {
    g_setDocJson(g_doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
  }

  const g_SetSummaryOldHighlights = (tkn_ids) => {
    g_setSummaryJson(g_summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
  }

  const g_FindDocAlignmentPerSent = (sent_ind) => {
    let curr_sent_alignment_ids = g_summary_json.map((word) => {return (word.sent_id===sent_ind) ? word.alignment_id : []});
    curr_sent_alignment_ids = [].concat.apply([], curr_sent_alignment_ids); // merge into a single array (before was an array of arrays)
    const doc_ids = g_doc_json.filter((word) => {return word.alignment_id.some(r=> curr_sent_alignment_ids.includes(r))}).map((word) => {return word.tkn_id});
    return doc_ids
  }


  const g_oldAlignmentStateHandler = ({event, newValue, sent_ind}) => {

    if (newValue=='1'){
      g_setOldAlignmentState("none");
      g_SetDocOldHighlights([]);
      g_SetSummaryOldHighlights([]);
    } else if (newValue=='2'){
      g_setOldAlignmentState("sent");
      sent_ind = (sent_ind===-1) ? g_CurrSentInd : sent_ind
      const doc_ids = g_FindDocAlignmentPerSent(sent_ind)
      const summary_ids = g_summary_json.filter((word) => {return (word.all_highlighted && word.sent_id === sent_ind)}).map((word) => {return word.tkn_id});
      g_SetDocOldHighlights(doc_ids);
      g_SetSummaryOldHighlights(summary_ids);
    } else {
      g_setOldAlignmentState("all");
      const doc_ids = g_doc_json.filter((word) => {return word.all_highlighted}).map((word) => {return word.tkn_id});
      const summary_ids = g_summary_json.filter((word) => {return word.all_highlighted}).map((word) => {return word.tkn_id});
      g_SetDocOldHighlights(doc_ids);
      g_SetSummaryOldHighlights(summary_ids);
    }
  }

  g_oldAlignmentStateHandler.defaultProps = {
    sent_ind: -1
  }



  const g_hoverHandler = ({inOrOut, curr_alignment_id, tkn_id, isSummary}) => {
    // onMouseEnter for "REVISE HOVER"
    if (inOrOut === "in" && g_StateMachineState==="REVISE HOVER") { 
      g_setDocJson(g_doc_json.map((word) => word.alignment_id.includes(curr_alignment_id) ? {...word, old_alignment_hover: true} : {...word, old_alignment_hover: false}))
      g_setSummaryJson(g_summary_json.map((word) => word.alignment_id.includes(curr_alignment_id) ? {...word, old_alignment_hover: true} : {...word, old_alignment_hover: false}))
    } 
    // onMouseLeave for "REVISE HOVER"
    else if (inOrOut === "out" && g_StateMachineState==="REVISE HOVER") { 
      g_setDocJson(g_doc_json.map((word) => {return {...word, old_alignment_hover:false}}))
      g_setSummaryJson(g_summary_json.map((word) => {return {...word, old_alignment_hover:false}}))
    }
    // onMouseLeave for all the alignments choosing states
    else if (inOrOut === "out" && ["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(g_StateMachineState) && isSummary) { 
      g_setDocJson(g_doc_json.map((word) => {return {...word, red_color:false}}))
    }

  }

  const g_isRedLettered = (summary_tkn_id) => {
    if ((g_StateMachineState === "REVISE CLICKED") && (g_summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id > g_CurrSentInd}).length !== 0)){
      return false
    } else if ((g_summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id !== g_CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(g_StateMachineState))) {
      return false
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(g_StateMachineState)) {
      return true
    }

  }



  const g_MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
    g_setSliderBoldStateActivated(false);
    g_MachineStateHandler(g_summary_json,
                          g_StateMachineState, g_SetStateMachineState,
                          g_SetInfoMessage, g_handleErrorOpen, isPunct,
                          g_CurrSentInd, g_SetCurrSentInd, g_SetSummaryShadow,
                          g_AlignmentCount, g_SetAlignmentCount,
                          g_approveHighlightHandler,
                          clickedWordInfo, forceState, 
                          g_StartReviseStateHandler, g_ExitReviseHandler,
                          g_ReviseChooseAlignHandler, 
                          isBackBtn,
                          g_setPrevSummaryJsonRevise, g_setPrevDocJsonRevise,
                         );
  }

  g_MachineStateHandlerWrapper.defaultProps = {
    forceState: '',
    clickedWordInfo: [],
    isBackBtn: false
  }
  /*********************************************************************************************************************************************************************************************************************/

  
  
  /************************************ AVIVSL: ACTUAL ANNOTATION ********************************************** */



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
    console.log("inside toggleSummarySpanHighlight:")
    console.log(tkn_ids)
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
    if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id > CurrSentInd}).length !== 0)){
      return false
    } else if ((summary_json.filter((word) => {return word.tkn_id === summary_tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))) {
      return false
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      return true
    }

  }



  const MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
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




/************************************************************************************************* AVIVSL: GUIDED_ANNOTATION *****************************************************************************************/
  /*******  useState for smooth transition to "SENTENCE END" or "SUMMARY END" *******/
  const g_finishedSent = useRef(false);

  useEffect(() => {
    const isNotStart = (g_StateMachineState !== "START" && g_summary_json.filter((word) => {return word.sent_id===g_CurrSentInd && word.shadowed}).length !== 0);
    const isAllSentHighlighted = (g_summary_json.filter((word) => { return word.sent_id===g_CurrSentInd && !(word.all_highlighted || word.span_highlighted) && !isPunct(word.word)}).length === 0); // need "isNotStart" because also for "START" state isAllSentHighlighted=true because no sentence is span-highlighted yet 
    if (isAllSentHighlighted && isNotStart && !g_finishedSent.current && !["REVISE HOVER", "REVISE CLICKED"].includes(g_StateMachineState)) {
      g_finishedSent.current = true;


      const isLastSent = (Math.max.apply(Math, g_summary_json.map(word => { return word.sent_id; })) === g_CurrSentInd)
      if (isLastSent) {
        g_MachineStateHandlerWrapper({forceState:"SUMMARY END"});   
      } else {
        g_MachineStateHandlerWrapper({forceState:"SENTENCE END"});   
      }
    }

    // if regretted summary highlighting
    else if(!isAllSentHighlighted && isNotStart && g_finishedSent.current && !["REVISE HOVER", "REVISE CLICKED"].includes(g_StateMachineState)) { 
      g_finishedSent.current = false;
      g_MachineStateHandlerWrapper({forceState:"ANNOTATION"});
    }
  }, [g_summary_json]);
  /*********************************************************************************/ 

  /*********** useState to update the summary shadow when next sentence ***********/ 
  useEffect(() => {
    g_SetSummaryShadowAndUpdateHighlights(g_CurrSentInd);
  }, [g_CurrSentInd]);
  /********************************************************************************/

  /***************************** bolding controlling *****************************/ 
  useEffect(() => {
    // when choosing a span - if nothing is span_highlighted then all sent matches are in bold, otherwise only span_highlighted matches (when highlighting - something must be span-highlighted so automatically is '2')
    if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(g_StateMachineState) && !g_sliderBoldStateActivated) {
      const bold_state = (g_summary_json.filter((word) => {return word.span_highlighted}).length === 0) ? '3' : '2'; // if no span is current highlighted - bold everything, otherwise bold only currently highlighted span
      g_boldStateHandler(undefined, bold_state);
    } else if (["REVISE HOVER", "REVISE CLICKED"].includes(g_StateMachineState) && !g_sliderBoldStateActivated) {
      g_boldStateHandler(undefined, '1');
    }
  }, [g_StateMachineState, g_summary_json]);
  /********************************************************************************/

   /***************************** old alignments controlling *****************************/ 
   const g_prevState = useRef("")
   useEffect(() => {
     if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(g_StateMachineState)) {
       g_oldAlignmentStateHandler({event:undefined, newValue:'3', sent_ind:-1});
     } else if (g_StateMachineState === "REVISE CLICKED"){
       g_oldAlignmentStateHandler({event:undefined, newValue:'1', sent_ind:-1});
     } else if (g_StateMachineState === "REVISE HOVER"){
       g_oldAlignmentStateHandler({event:undefined, newValue:'3', sent_ind:-1});
     }
     g_prevState.current = g_StateMachineState;
   }, [g_StateMachineState, g_AlignmentCount]);
   /********************************************************************************/
   useEffect(() => {
     console.log(`g_CurrSentInd is updated and is now ${g_CurrSentInd}`)
   }, [g_CurrSentInd]);
   
   
   
   /******************* highlighting while choosing spans to help *******************/ 


   useEffect(() => {
     if (g_DocOnMouseDownID !== "-1"){
       g_setDocOnMouseDownActivated(true)
     } else if (g_DocOnMouseDownID === "-1"){
       g_setDocOnMouseDownActivated(false)
     } 
     
     if (g_SummaryOnMouseDownID !== "-1") {
       g_setSummaryOnMouseDownActivated(true)
     } else {
       g_setSummaryOnMouseDownActivated(false)
     }
   }, [g_DocOnMouseDownID,g_SummaryOnMouseDownID]);
   
   //AVIVSL: TODO: find way to reset the whole hovering process when the onMouseUp occurs outside of the text (maybe when g_docOnMouseDownActivated===false or g_summaryOnMouseDownActivated===false) --> maybe use a useRef to remember which one was the one activated - summary or doc?
   useEffect(() => {
     if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(g_StateMachineState)){
       if(g_docOnMouseDownActivated) {
         console.log(`g_DocOnMouseDownID is ${g_DocOnMouseDownID} and g_hoverActivatedId ia ${g_hoverActivatedId}`)
         const min_ID =  (g_DocOnMouseDownID > g_hoverActivatedId) ? g_hoverActivatedId : g_DocOnMouseDownID;
         const max_ID =  (g_DocOnMouseDownID > g_hoverActivatedId) ? g_DocOnMouseDownID : g_hoverActivatedId;
         let chosen_IDs = [];
         for(let i=min_ID; i<=max_ID; i++){
           chosen_IDs.push(i);
         }
         g_setDocJson(g_doc_json.map((word) => chosen_IDs.includes(word.tkn_id)? {...word, span_alignment_hover:true}:{...word, span_alignment_hover:false}))
       } else if (!g_docOnMouseDownActivated){
         g_setDocJson(g_doc_json.map((word) => {return {...word, span_alignment_hover:false}}))
       }
       if(g_summaryOnMouseDownActivated) {
         console.log(`g_SummaryOnMouseDownID is ${g_SummaryOnMouseDownID} and g_hoverActivatedId ia ${g_hoverActivatedId}`)
         const min_ID =  (g_SummaryOnMouseDownID > g_hoverActivatedId) ? g_hoverActivatedId : g_SummaryOnMouseDownID;
         const max_ID =  (g_SummaryOnMouseDownID > g_hoverActivatedId) ? g_SummaryOnMouseDownID : g_hoverActivatedId;
         let chosen_IDs = [];
         for(let i=min_ID; i<=max_ID; i++){
           chosen_IDs.push(i);
         }
         g_setSummaryJson(g_summary_json.map((word) => chosen_IDs.includes(word.tkn_id)? {...word, span_alignment_hover:true}:{...word, span_alignment_hover:false}))
       } else if (!g_summaryOnMouseDownActivated){
         g_setSummaryJson(g_summary_json.map((word) => {return {...word, span_alignment_hover:false}}))
         
         if (g_isRedLettered(g_hoverActivatedId) && g_hoverActivatedDocOrSummary === "summary") {
           const doc_tkn_ids = g_doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return g_checkIfLemmasMatch({doc_id:doc_id, summary_ids:[g_hoverActivatedId], isHover:true})});

           g_setDocJson(g_doc_json.map((word) => doc_tkn_ids.includes(word.tkn_id) ? {...word, red_color:true} : {...word, red_color:false}))  
         }  
       }
     }
   }, [g_docOnMouseDownActivated, g_summaryOnMouseDownActivated, g_hoverActivatedId]);
   /********************************************************************************/ 




/*********************************************************************************************************************************************************************************************************************/
















  /************************************ AVIVSL: ACTUAL ANNOTATION *********************************************/

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
      console.log(`curr state is ${StateMachineState}`);
      console.log(`curr CurrSentInd is ${CurrSentInd}`)
      console.log("back to square one");
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
      console.log(`CurrSentInd is updated and is now ${CurrSentInd}`)
      console.log('doc_json:')
      console.log(doc_json)
      console.log('t_doc_json:')
      console.log(t_doc_json)
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
      if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)){
        if(docOnMouseDownActivated) {
          console.log(`DocOnMouseDownID is ${DocOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
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
          console.log(`SummaryOnMouseDownID is ${SummaryOnMouseDownID} and hoverActivatedId ia ${hoverActivatedId}`)
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


        // let updated_doc_json = [];
        // t_json_file["doc"].forEach((word) => {updated_doc_json = [...updated_doc_json, word];})
        
        
        
        // t_setDocJson(updated_doc_json);
        // t_setOriginDocJson(updated_doc_json);
        
        
        
        
        
        // // get summary_json
        // let updated_summary_json = [];
        // t_json_file["summary"].forEach((word) => {updated_summary_json = [...updated_summary_json, word];})
        // t_setSummaryJson(updated_summary_json);
        // t_setOriginSummaryJson(updated_summary_json);
        // get all the matrices and the paragraph breaks
        t_setAllLemmaMtx(t_start_json_file["all_lemma_match_mtx"]);
        t_setImportantLemmaMtx(t_start_json_file["important_lemma_match_mtx"]);
        t_setDocParagraphBreaks(t_start_json_file["doc_paragraph_breaks"])
        
        
        // get state messages
        t_setStateMessages(tutorial_state_messages)

        // let updated_state_messages_json = [];
        // tutorial_state_messages.forEach((t_state) => {updated_doc_json = [...updated_doc_json, t_state];})
        // t_setStateMessages(updated_state_messages_json)
        // console.log("tutorial_state_messages is:")
        // console.log(tutorial_state_messages)


        fetch(`/`).then(
          res => console.log(res)
        )
      }





      const g_getTasks = () => {
        const curr_id = '0';

        g_addDocWordComponents(g_json_file[curr_id]["doc"])
        g_addSummaryWordComponents(g_json_file[curr_id]["summary"])
        g_setAllLemmaMtx(g_json_file[curr_id]["all_lemma_match_mtx"]);
        g_setImportantLemmaMtx(g_json_file[curr_id]["important_lemma_match_mtx"]);
        g_setDocParagraphBreaks(g_json_file[curr_id]["doc_paragraph_breaks"])
        fetch(`/`).then(
          res => console.log(res)
        )
          
        }
    


      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const curr_id = urlParams.get('id');
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
      console.log(event);
      alert("Submitted!");
    }

    const g_SubmitHandler = (event) => {
      alert("Submitted!");
    }





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
          <Route path='/instructions' element={<Instructions />} />
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




          <Route path='/guidedAnnotation' element={<Annotation
                                              isTutorial={false}
                                              isGuidedAnnotation={true} 
                                              task_id={'0'}
                                              doc_json = {g_doc_json}
                                              setDocJson = {g_setDocJson}
                                              summary_json = {g_summary_json}
                                              setSummaryJson = {g_setSummaryJson}
                                              all_lemma_match_mtx = {g_all_lemma_match_mtx}
                                              important_lemma_match_mtx = {g_important_lemma_match_mtx}
                                              doc_paragraph_breaks = {g_doc_paragraph_breaks}
                                              StateMachineState = {g_StateMachineState}
                                              SetStateMachineState = {g_SetStateMachineState}
                                              handleErrorOpen = {g_handleErrorOpen}
                                              isPunct = {isPunct}
                                              toggleSummarySpanHighlight = {g_toggleSummarySpanHighlight}
                                              toggleDocSpanHighlight = {g_toggleDocSpanHighlight}
                                              boldState = {g_boldState}
                                              boldStateHandler = {g_boldStateHandler}
                                              SubmitHandler = {g_SubmitHandler}
                                              CurrSentInd = {g_CurrSentInd}
                                              SetCurrSentInd = {g_SetCurrSentInd}
                                              InfoMessage = {g_InfoMessage}
                                              MachineStateHandlerWrapper = {g_MachineStateHandlerWrapper}
                                              AlignmentCount = {g_AlignmentCount} 
                                              SetAlignmentCount = {g_SetAlignmentCount}
                                              oldAlignmentState = {g_oldAlignmentState}
                                              oldAlignmentStateHandler = {g_oldAlignmentStateHandler}
                                              hoverHandler = {g_hoverHandler}
                                              DocOnMouseDownID = {g_DocOnMouseDownID}
                                              SetDocOnMouseDownID = {g_SetDocOnMouseDownID}
                                              SummaryOnMouseDownID = {g_SummaryOnMouseDownID}
                                              SetSummaryOnMouseDownID = {g_SetSummaryOnMouseDownID}
                                              setDocOnMouseDownActivated = {g_setDocOnMouseDownActivated}
                                              docOnMouseDownActivated = {g_docOnMouseDownActivated}
                                              setSummaryOnMouseDownActivated = {g_setSummaryOnMouseDownActivated}
                                              summaryOnMouseDownActivated = {g_summaryOnMouseDownActivated}
                                              setHoverActivatedId = {g_setHoverActivatedId}
                                              setHoverActivatedDocOrSummary = {g_setHoverActivatedDocOrSummary}
                                              t_StateMachineStateId = {undefined}
                                              t_SetStateMachineStateId = {undefined}
                                              t_state_messages = {undefined}
                                              t_start_doc_json = {undefined}
                                              t_middle_doc_json = {undefined}
                                              t_sent_end_doc_json = {undefined}
                                              t_submit_doc_json = {undefined}
                                              t_start_summary_json = {undefined}
                                              t_middle_summary_json = {undefined}
                                              t_sent_end_summary_json = {undefined}
                                              t_submit_summary_json = {undefined}
                                              />} 
            />

          <Route path='/' element={<Annotation 
                                              isTutorial={false}
                                              isGuidedAnnotation={false} 
                                              task_id={task_id} 
                                              doc_json = {doc_json}
                                              setDocJson = {setDocJson}
                                              summary_json = {summary_json}
                                              setSummaryJson = {setSummaryJson}
                                              all_lemma_match_mtx = {all_lemma_match_mtx}
                                              important_lemma_match_mtx = {important_lemma_match_mtx}
                                              doc_paragraph_breaks = {doc_paragraph_breaks}
                                              StateMachineState = {StateMachineState}
                                              SetStateMachineState = {SetStateMachineState}
                                              handleErrorOpen = {handleErrorOpen}
                                              isPunct = {isPunct}
                                              toggleSummarySpanHighlight = {toggleSummarySpanHighlight}
                                              toggleDocSpanHighlight = {toggleDocSpanHighlight}
                                              boldState = {boldState}
                                              boldStateHandler = {boldStateHandler}
                                              SubmitHandler = {SubmitHandler}
                                              CurrSentInd = {CurrSentInd}
                                              SetCurrSentInd = {SetCurrSentInd}
                                              InfoMessage = {InfoMessage}
                                              MachineStateHandlerWrapper = {MachineStateHandlerWrapper}
                                              AlignmentCount = {AlignmentCount} 
                                              SetAlignmentCount = {SetAlignmentCount}
                                              oldAlignmentState = {oldAlignmentState}
                                              oldAlignmentStateHandler = {oldAlignmentStateHandler}
                                              hoverHandler = {hoverHandler}
                                              DocOnMouseDownID = {DocOnMouseDownID}
                                              SetDocOnMouseDownID = {SetDocOnMouseDownID}
                                              SummaryOnMouseDownID = {SummaryOnMouseDownID}
                                              SetSummaryOnMouseDownID = {SetSummaryOnMouseDownID}
                                              setDocOnMouseDownActivated = {setDocOnMouseDownActivated}
                                              docOnMouseDownActivated = {docOnMouseDownActivated}
                                              setSummaryOnMouseDownActivated = {setSummaryOnMouseDownActivated}
                                              summaryOnMouseDownActivated = {summaryOnMouseDownActivated}
                                              setHoverActivatedId = {setHoverActivatedId}
                                              setHoverActivatedDocOrSummary = {setHoverActivatedDocOrSummary}
                                              t_StateMachineStateId = {undefined}
                                              t_SetStateMachineStateId = {undefined}
                                              t_state_messages = {undefined}
                                              t_start_doc_json = {undefined}
                                              t_middle_doc_json = {undefined}
                                              t_sent_end_doc_json = {undefined}
                                              t_submit_doc_json = {undefined}
                                              t_start_summary_json = {undefined}
                                              t_middle_summary_json = {undefined}
                                              t_sent_end_summary_json = {undefined}
                                              t_submit_summary_json = {undefined}
                                              />} 
            />

        </Routes>
      </div>
      <Snackbar open={error_message !== ""} autoHideDuration={6000} onClose={handleErrorClose}>
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

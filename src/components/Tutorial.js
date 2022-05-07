import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Annotation from './Annotation';
import { Player, BigPlayButton } from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"; // import css

import { MachineStateHandler,  } from './Annotation_event_handlers';
import { TutorialCard } from './TutorialCard';
import { t_StateMachineStateIdHandler, getTutorialCardTitle, getTutorialCardText } from './Tutorial_utils'
import _ from 'underscore';


const Tutorial = ({doc_json, setDocJson,
                  t_start_doc_json, t_middle_doc_json, t_sent_end_doc_json, t_submit_doc_json, 
                  summary_json, setSummaryJson,
                  t_start_summary_json, t_middle_summary_json, t_sent_end_summary_json, t_submit_summary_json,
                  all_lemma_match_mtx, setAllLemmaMtx,
                  important_lemma_match_mtx, setImportantLemmaMtx,
                  doc_paragraph_breaks, setDocParagraphBreaks,
                  t_state_messages,
                  showAlert, setShowAlert, SUMMARY_WORD_CNT_THR,
                  SubmitModalShow, setSubmitModalShow}) => {

                    
  const [boldState, setBoldState] = useState("sent"); // for user to choose if want full sentence, span or no lemma matching (denoted as "sent", "span" and "none", accordingly)
  const [oldAlignmentState, setOldAlignmentState] = useState("all"); // for user to choose if want full highlighting history, only current sentence's highlighting history or no history (denoted as "all", "sent" and "none", accordingly)
  const [StateMachineState, SetStateMachineState] = useState("ANNOTATION");
  const [error_message, setErrorMessage] = React.useState("");
  const [CurrSentInd, SetCurrSentInd] = useState(-1);
  const [InfoMessage, SetInfoMessage] = useState("");
  const [AlignmentCount, SetAlignmentCount] = useState(3)

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

  const [t_StateMachineStateId, t_SetStateMachineStateId] = useState(0);

  /*************************************** error handling *************************************************/
  const Alert = React.forwardRef(function Alert(props, ref) {return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;});
  


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

  const toggleDocSpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
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
    console.log("inside toggleSummarySpanHighlight:")
    console.log(tkn_ids)
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
    
    // // no alignment
    if ([16].includes(t_StateMachineStateId) && (typeof forceState !== 'string')  && (!["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) && (doc_json.filter((word) => {return word.span_highlighted}).length === 0) && (StateMachineState!=="START") && !noAlignApproved) {
      setNoAlignModalShow(true)
      return
    }
    setNoAlignApproved(false)
    
    
    
    setSliderBoldStateActivated(false);
    // if ([5,16].includes(t_StateMachineStateId) || ([11,13].includes(t_StateMachineStateId) && forceState==="REVISE HOVER") || (t_StateMachineStateId === 12 && forceState !== "FINISH REVISION") || ([14,15].includes(t_StateMachineStateId) && ["SENTENCE END", "ANNOTATION", "SUMMARY END", undefined].includes(forceState))) {
    //   console.log(`forceState situation with: state ${forceState}`);
    // }
    // else{
    //   console.log("ignore MachineStateHandlerWrapper");
    //   return; // AVIVSL: added this so people can't change anything
    // }
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
    useEffect(() => {
      console.log(`t_doc_json is:`)
      console.log(doc_json)
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



    const SubmitHandler = (event) => {
      return
    }


  return ( 
      <>
         <Annotation 
                    isTutorial = {true}                                         isGuidedAnnotation={false} 
                    task_id={'0'}                                               doc_paragraph_breaks = {doc_paragraph_breaks}
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
                    t_StateMachineStateId = {t_StateMachineStateId}             t_SetStateMachineStateId = {t_SetStateMachineStateId}
                    t_start_doc_json = {t_start_doc_json}                       t_middle_doc_json = {t_middle_doc_json}
                    t_sent_end_doc_json = {t_sent_end_doc_json}                 t_submit_doc_json = {t_submit_doc_json}
                    t_start_summary_json = {t_start_summary_json}               t_middle_summary_json = {t_middle_summary_json}
                    t_sent_end_summary_json = {t_sent_end_summary_json}         t_submit_summary_json = {t_submit_summary_json}
                    t_state_messages = {t_state_messages}
                    g_guiding_info_msg = {undefined}                            g_is_good_alignment = {undefined}
                    g_show_hint = {undefined}                                   g_setShowHint = {undefined}
                    g_hint_msg = {{"text":"", "title":""}}                      g_showWhereNavbar = {undefined}
                    g_open_hint={undefined}                                     g_setOpenHint={undefined}
                    g_with_glow_hint={undefined}                                g_setWithGlowHint={undefined}
                    g_answer_words_to_glow={{"type":"", "ids":[]}}              g_FinishedModalShow={undefined}
                    g_Guider_msg={{"type":"", "where":"", "text":""}}           g_setGuiderMsg={undefined}
                    
                    OpeningModalShow = {undefined}                              setOpeningModalShow = {undefined}
                    noAlignModalShow = {noAlignModalShow}                       setNoAlignModalShow = {setNoAlignModalShow}
                    noAlignApproved = {noAlignApproved}                         setNoAlignApproved = {setNoAlignApproved}
                    changeSummarySentHandler = {changeSummarySentHandler}
                    showAlert={showAlert}                                       setShowAlert={setShowAlert}
                    SubmitModalShow={SubmitModalShow}                           setSubmitModalShow={setSubmitModalShow}
                    g_answer_modal_msg={undefined}
                    />
        
        {/* <Player
          playsInline
          src="./Videos/old-highlights_m.mp4"
          fluid={false}
          aspectRatio="auto"
        >
          <BigPlayButton position="center" />
        </Player> */}
    </>
  )
}

export default Tutorial

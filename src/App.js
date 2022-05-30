import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';


import Annotation from './components/Annotation';
import json_file from './data/data_for_mturk.json';
// import mturk_results_json_file from './data/mturk_results/IAA/IAA2/assignments_results.json'
// import submitted_tasks_ids_json_file from './data/mturk_results/IAA/IAA2/submitted_tasks_ids.json'

import mturk_results_json_file from './data/mturk_results/production/first_batch/7/assignments_results.json'
import submitted_tasks_ids_json_file from './data/mturk_results/production/first_batch/7/submitted_tasks_ids.json'

// import mturk_results_json_file from './data/mturk_results/inspection/1/assignments_results.json'
// import submitted_tasks_ids_json_file from './data/mturk_results/inspection/1/submitted_tasks_ids.json'

// import mturk_results_json_file from './data/mturk_results/sandbox/assignments_results.json'
// import submitted_tasks_ids_json_file from './data/mturk_results/sandbox/submitted_tasks_ids.json'

// import mturk_results_json_file from './data/mturk_results/assignments_results.json'
// import submitted_tasks_ids_json_file from './data/mturk_results/submitted_tasks_ids.json'





import { MachineStateHandler } from './components/Annotation_event_handlers';
import _ from 'underscore';

const App = () => {

  const SUMMARY_WORD_CNT_THR = 0.85 // if proceeding to next sentence with ratio of highlighted summary words (out of all the sentence) is less or equals to threshold - then a warning apppears. Otherwise, good alert appears.  

  
  // AVIVSL: ACTUAL ANNOTATION
  const [task_id, setTaskID] = useState("-1"); // default for task_id is -1
  const [doc_json, setDocJson] = useState([]);
  const [summary_json, setSummaryJson] = useState([]); 
  const [doc_paragraph_breaks, setDocParagraphBreaks] = useState([]);
  const [boldState, setBoldState] = useState("sent"); // for user to choose if want full sentence, span or no lemma matching (denoted as "sent", "span" and "none", accordingly)
  const [oldAlignmentState, setOldAlignmentState] = useState("all"); // for user to choose if want full highlighting history, only current sentence's highlighting history or no history (denoted as "all", "sent" and "none", accordingly)
  const [StateMachineState, SetStateMachineState] = useState("START");
  const [error_message, setErrorMessage] = React.useState("");
  const [CurrSentInd, SetCurrSentInd] = useState(1);
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

  const [showAlert, setShowAlert] = useState("closed") // one of {"success", "warning", "closed"}

  const [SubmitModalShow, setSubmitModalShow] = useState(false) // one of {"success", "warning", "closed"}

  //mturk
  const [isFinished, SetIsFinished] = useState(false)
  const [OpeningModalShow, setOpeningModalShow] = useState(true);
  const [started, setStarted] = useState(false)
  const [Alignments, setAlignments] = useState(-1)







  /*************************************** error handling *************************************************/
  const Alert = React.forwardRef(function Alert(props, ref) {return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;});

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


  const SetDocOldHighlights = (tkn_ids) => {
    setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
  }

  const SetSummaryOldHighlights = (tkn_ids) => {
    setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, old_alignments: true } : { ...word, old_alignments: false }))
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

  const changeSummarySentHandler = ({isNext}) => {
    if (isNext){
      SetCurrSentInd(CurrSentInd+1)
      const summary_currSent_old_highlighted_tkn_cnt = summary_json.filter((word) => {return (!isPunct(word.word) && word.sent_id===CurrSentInd && word.old_alignments)}).length // number of words in curr sentence (the one we change from) that was saved as part of an alignment
      const summary_currSent_tkn_cnt = summary_json.filter((word) => {return (!isPunct(word.word) && word.sent_id===CurrSentInd)}).length // all (non-punctuation) words in curr sentence (the one we change from)

      if(summary_currSent_old_highlighted_tkn_cnt / summary_currSent_tkn_cnt > SUMMARY_WORD_CNT_THR) {
        setShowAlert("success")
        // console.log("good!")
      } else {
        setShowAlert("warning")
        // console.log("bad!")
      }
    
    } else {
      SetCurrSentInd(CurrSentInd-1)
    }
    setDocJson(doc_json.map((word) => {return {...word, span_highlighted:false}}))
    setSummaryJson(summary_json.map((word) => {return {...word, span_highlighted:false}}))
  }



  const MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
    

    // no alignment
    if ((typeof forceState !== 'string') && (!["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) && (doc_json.filter((word) => {return word.span_highlighted}).length === 0) && (StateMachineState!=="START") && !noAlignApproved) {
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
          const min_ID =  (SummaryOnMouseDownID > hoverActivatedId) ? hoverActivatedId : SummaryOnMouseDownID;
          const max_ID =  (SummaryOnMouseDownID > hoverActivatedId) ? SummaryOnMouseDownID : hoverActivatedId;
          let chosen_IDs = [];
          for(let i=min_ID; i<=max_ID; i++){
            chosen_IDs.push(i);
          }
          setSummaryJson(summary_json.map((word) => chosen_IDs.includes(word.tkn_id)? {...word, span_alignment_hover:true}:{...word, span_alignment_hover:false}))
        } else if (!summaryOnMouseDownActivated){
          setSummaryJson(summary_json.map((word) => {return {...word, span_alignment_hover:false}}))
        }
      }
    }, [docOnMouseDownActivated, summaryOnMouseDownActivated, hoverActivatedId]);




    
/**************************************************************************************************************/
    useEffect(() => {
      if (started){
        MachineStateHandlerWrapper({clickedWordInfo:"", forceState:"REVISE HOVER", isBackBtn:false});
      }
    }, [started])


    useEffect(() => {

      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const task_id = urlParams.get('id');
        const curr_task = submitted_tasks_ids_json_file[parseInt(task_id)]
        console.log(`curr_task:${JSON.stringify(curr_task)}`)
        // const hit_type_id = urlParams.get('hit_type_id');
        // const hit_id = urlParams.get('hit_id'); 
        // const assign_id = urlParams.get('assign_id');
        // const worker_id = urlParams.get('worker_id');
        const curr_id = `${curr_task["hit_type_id"]};${curr_task["hit_id"]};${curr_task["assign_id"]};${curr_task["worker_id"]}`

        setTaskID(curr_id);

        setDocJson(mturk_results_json_file[curr_id]["doc"])
        setSummaryJson(mturk_results_json_file[curr_id]["summary"])
        setDocParagraphBreaks(mturk_results_json_file[curr_id]["doc_paragraph_breaks"])
        
        // get all the alignments
        const doc_alignment_arr = [...new Set([].concat.apply([], mturk_results_json_file[curr_id]["doc"].map((word) => word.alignment_id)))]
        const summary_alignment_arr = [...new Set([].concat.apply([], mturk_results_json_file[curr_id]["summary"].map((word) => word.alignment_id)))]
        const alignment_arr = [...new Set(doc_alignment_arr.concat(summary_alignment_arr))].sort()
        setAlignments(alignment_arr)
        // setDocParagraphBreaks(json_file['2']["doc_paragraph_breaks"]) // update this from "json_file" to "mturk_results_json_file" when I start saving this in the task and '0' to the equivalent key
        fetch(`/`).then(
          res => console.log(res)
        )
          
        }
      getTasks();
      setStarted(true)
    }, [])


    const SubmitHandler = (event) => {
      approveHighlightHandler()
      SetIsFinished(true)
    }






  return (
    <Router>
      <div className='container-background'>
        <Routes>
          <Route path='/' element={<Annotation 
                                              isTutorial={false}                                          isGuidedAnnotation={false}                                
                                              task_id={task_id}                                           doc_paragraph_breaks={doc_paragraph_breaks}
                                              doc_json={doc_json}                                         setDocJson={setDocJson}                                 
                                              summary_json={summary_json}                                 setSummaryJson={setSummaryJson}
                                              StateMachineState={StateMachineState}                       SetStateMachineState={SetStateMachineState}
                                              handleErrorOpen={handleErrorOpen}                           isPunct={isPunct}
                                              toggleSummarySpanHighlight={toggleSummarySpanHighlight}     toggleDocSpanHighlight={toggleDocSpanHighlight}
                                              boldState = {boldState}                                     
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
                                              Alignments={Alignments}                                     setAlignments={setAlignments}
                                              
                                              
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
                                              changeSummarySentHandler = {changeSummarySentHandler}
                                              showAlert={showAlert}                                       setShowAlert={setShowAlert}
                                              SubmitModalShow={SubmitModalShow}                           setSubmitModalShow={setSubmitModalShow}
                                              g_answer_modal_msg={undefined}
                                              />} 
            />

        </Routes>
      </div>
    </Router>
  )
}

export default App

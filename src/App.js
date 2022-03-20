import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';

import StartPage from './components/StartPage'
import Instructions from './components/Instructions'
import GuidedAnnotation from './components/GuidedAnnotation'
import Annotation from './components/Annotation'
import json_file from './data/data_for_mturk.json'
import { MachineStateHandler } from './components/Annotation_event_handlers';
import _ from 'underscore';



const App = () => {

  const [task_id, setTaskID] = useState("-1"); // default for task_id is -1
  const [doc_json, setDocJson] = useState([]);
  const [summary_json, setSummaryJson] = useState([]); 
  const [all_lemma_match_mtx, setAllLemmaMtx] = useState([]);
  const [important_lemma_match_mtx, setImportantLemmaMtx] = useState([]);
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
      const newWord = {...word, boldfaced, span_highlighted, all_highlighted, old_alignments, old_alignment_hover, span_alignment_hover, alignment_id}; 
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

  const toggleDocSpanHighlight = (tkn_ids) => {
    setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word))
  }

  const toggleSummarySpanHighlight = (tkn_ids) => {
    setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, span_highlighted: !word.span_highlighted } : word));
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

  const checkIfLemmasMatch = ({doc_id, summary_ids, isSpan}) => {
    // const which_match_mtx = (isSpan) ? all_lemma_match_mtx : important_lemma_match_mtx;
    const which_match_mtx = important_lemma_match_mtx;
    const matching_summary_ids = summary_ids.filter((summary_id) => {return all_lemma_match_mtx[doc_id][summary_id] === 1;})
    return matching_summary_ids.length > 0
  }

  const boldStateHandler = (event, newValue) => {
    if (newValue=='1'){
      setBoldState("none");
      SetDocBoldface([]);
    } else if (newValue=='2'){
      setBoldState("span");
      const summary_ids = summary_json.filter((word) => {return word.span_highlighted}).map((word) => {return word.tkn_id});
      const isSpan = true;
      const tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id, summary_ids, isSpan})});
      SetDocBoldface(tkn_ids);
    } else {
      setBoldState("sent");
      const isSpan = false;
      const summary_ids = summary_json.filter((word) => {return word.shadowed}).map((word) => {return word.tkn_id});
      const tkn_ids = doc_json.map((word) => {return word.tkn_id}).filter((doc_id) => {return checkIfLemmasMatch({doc_id, summary_ids, isSpan})});
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
      // const doc_ids = doc_json.filter((word) => {return (word.all_highlighted && word.sent_id === sent_ind)}).map((word) => {return word.tkn_id});
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


  
  const reviseHoverHandler = ({inOrOut, curr_alignment_id}) => {
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
  }



  const MachineStateHandlerWrapper = ({clickedWordInfo, forceState, isBackBtn}) => {
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
    if (["ANNOTATION", "SENTENCE END", "SUMMARY END"].includes(StateMachineState)) {
      const bold_state = (summary_json.filter((word) => {return word.span_highlighted}).length === 0) ? '3' : '2'; // if no span is current highlighted - bold everything, otherwise bold only currently highlighted span
      boldStateHandler(undefined, bold_state);
    } else if (["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState)) {
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
        }
      }
    }, [docOnMouseDownActivated, summaryOnMouseDownActivated, hoverActivatedId]);
    /********************************************************************************/ 


    // listen to mouse up occuring anywhere in the page
    // useEffect(() => {
    //   window.addEventListener('mouseup', (event) => {  
    //     console.log(`mouseup with DocOnMouseDownID ${DocOnMouseDownID}`)
    //     if(docOnMouseDownActivated){
          

    //           if (StateMachineState === "START"){ // during START state no highlighting
    //             handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    //           } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
    //               console.log(`now inside here with ${DocOnMouseDownID}`)
    //               const chosen_IDs = doc_json.filter((word) => {return word.span_alignment_hover}).map((word) => {return word.tkn_id})
    //               toggleDocSpanHighlight(chosen_IDs);
    //               SetDocOnMouseDownID("-1"); 
    //           }





    //     } 
    //   })
    // }, []);


    useEffect(() => {
      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const curr_id = urlParams.get('id');
        setTaskID(curr_id);

        addDocWordComponents(json_file[curr_id]["doc"])
        addSummaryWordComponents(json_file[curr_id]["summary"])
        setAllLemmaMtx(json_file[curr_id]["all_lemma_match_mtx"]);
        setImportantLemmaMtx(json_file[curr_id]["important_lemma_match_mtx"]);

        fetch(`/`).then(
          res => console.log(res)
        )
          
        }

      getTasks();
    }, [])


    const SubmitHandler = (event) => {
      console.log(event);
      alert("Submitted!");
    }
  return (
    <Router>
      <div className='container'>
        <Routes>
          <Route path='/' element={<StartPage />} />
          <Route path='/homepage' element={<StartPage />} />
          <Route path='/instructions' element={<Instructions />} />
          <Route path='/guidedAnnotation' element={<GuidedAnnotation />} />
          <Route path='/annotation' element={<Annotation 
                                              task_id={task_id} 
                                              doc_json = {doc_json}
                                              summary_json = {summary_json}
                                              all_lemma_match_mtx = {all_lemma_match_mtx}
                                              important_lemma_match_mtx = {important_lemma_match_mtx}
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
                                              InfoMessage = {InfoMessage}
                                              MachineStateHandlerWrapper = {MachineStateHandlerWrapper}
                                              AlignmentCount = {AlignmentCount} 
                                              SetAlignmentCount = {SetAlignmentCount}
                                              oldAlignmentState = {oldAlignmentState}
                                              oldAlignmentStateHandler = {oldAlignmentStateHandler}
                                              reviseHoverHandler = {reviseHoverHandler}
                                              DocOnMouseDownID = {DocOnMouseDownID}
                                              SetDocOnMouseDownID = {SetDocOnMouseDownID}
                                              SummaryOnMouseDownID = {SummaryOnMouseDownID}
                                              SetSummaryOnMouseDownID = {SetSummaryOnMouseDownID}
                                              setDocOnMouseDownActivated = {setDocOnMouseDownActivated}
                                              docOnMouseDownActivated = {docOnMouseDownActivated}
                                              setSummaryOnMouseDownActivated = {setSummaryOnMouseDownActivated}
                                              summaryOnMouseDownActivated = {summaryOnMouseDownActivated}
                                              setHoverActivatedId = {setHoverActivatedId}
                                              />} 
          />

        </Routes>
      </div>
      <Snackbar open={error_message !== ""} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error_message}
        </Alert>
      </Snackbar>
    </Router>
  )
}

export default App

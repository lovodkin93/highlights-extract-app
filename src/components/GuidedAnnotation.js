import { g_MachineStateHandler } from './Annotation_event_handlers';
import { useState, useEffect, useRef } from 'react'
import Annotation from './Annotation';



const GuidedAnnotation = ({isPunct,
                          g_handleErrorOpen, g_handleErrorClose,
                          g_doc_json, g_setDocJson,
                          g_summary_json, g_setSummaryJson,
                          g_all_lemma_match_mtx, g_setAllLemmaMtx,
                          g_important_lemma_match_mtx, g_setImportantLemmaMtx,
                          g_doc_paragraph_breaks, g_setDocParagraphBreaks,
                          g_boldState, g_setBoldState,
                          g_oldAlignmentState, g_setOldAlignmentState,
                          g_StateMachineState, g_SetStateMachineState,
                          g_error_message, g_setErrorMessage,
                          g_CurrSentInd, g_SetCurrSentInd,
                          g_InfoMessage, g_SetInfoMessage,
                          g_AlignmentCount, g_SetAlignmentCount,
                          g_prevStateMachineState, g_setPrevStateMachineState,
                          g_prevSummarySpanHighlights, g_setPrevSummarySpanHighlights,
                          g_prevDocSpanHighlights, g_setPrevDocSpanHighlights,
                          g_prevSummaryJsonRevise, g_setPrevSummaryJsonRevise,
                          g_prevDocJsonRevise, g_setPrevDocJsonRevise,
                          g_DocOnMouseDownID, g_SetDocOnMouseDownID,
                          g_SummaryOnMouseDownID, g_SetSummaryOnMouseDownID,
                          g_docOnMouseDownActivated, g_setDocOnMouseDownActivated,
                          g_summaryOnMouseDownActivated, g_setSummaryOnMouseDownActivated,
                          g_hoverActivatedId, g_setHoverActivatedId,
                          g_hoverActivatedDocOrSummary, g_setHoverActivatedDocOrSummary,
                          g_sliderBoldStateActivated, g_setSliderBoldStateActivated,
                          g_guiding_msgs, g_setGuidingMsgs  }) => {
    /*************************************** error handling *************************************************/
  
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
  
  
    
  
    const g_toggleSummarySpanHighlight = ({tkn_ids, turn_on, turn_off}) => {
      g_setSliderBoldStateActivated(false)
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

   const g_SubmitHandler = (event) => {
    alert("Submitted!");
  }


   return (
          <Annotation
              isTutorial={false}                                            isGuidedAnnotation={true} 
              task_id={'0'}                                                 doc_paragraph_breaks = {g_doc_paragraph_breaks}
              doc_json = {g_doc_json}                                       setDocJson = {g_setDocJson}
              summary_json = {g_summary_json}                               setSummaryJson = {g_setSummaryJson}
              all_lemma_match_mtx = {g_all_lemma_match_mtx}                 important_lemma_match_mtx = {g_important_lemma_match_mtx}
              StateMachineState = {g_StateMachineState}                     SetStateMachineState = {g_SetStateMachineState}
              handleErrorOpen = {g_handleErrorOpen}                         isPunct = {isPunct}
              toggleSummarySpanHighlight = {g_toggleSummarySpanHighlight}   toggleDocSpanHighlight = {g_toggleDocSpanHighlight}
              boldState = {g_boldState}                                     boldStateHandler = {g_boldStateHandler}
              SubmitHandler = {g_SubmitHandler}                             hoverHandler = {g_hoverHandler}
              CurrSentInd = {g_CurrSentInd}                                 SetCurrSentInd = {g_SetCurrSentInd}
              InfoMessage = {g_InfoMessage}                                 MachineStateHandlerWrapper = {g_MachineStateHandlerWrapper}
              AlignmentCount = {g_AlignmentCount}                           SetAlignmentCount = {g_SetAlignmentCount}
              oldAlignmentState = {g_oldAlignmentState}                     oldAlignmentStateHandler = {g_oldAlignmentStateHandler}
              DocOnMouseDownID = {g_DocOnMouseDownID}                       SetDocOnMouseDownID = {g_SetDocOnMouseDownID}
              SummaryOnMouseDownID = {g_SummaryOnMouseDownID}               SetSummaryOnMouseDownID = {g_SetSummaryOnMouseDownID}
              docOnMouseDownActivated = {g_docOnMouseDownActivated}         setDocOnMouseDownActivated = {g_setDocOnMouseDownActivated}
              summaryOnMouseDownActivated = {g_summaryOnMouseDownActivated} setSummaryOnMouseDownActivated = {g_setSummaryOnMouseDownActivated}
              setHoverActivatedId = {g_setHoverActivatedId}                 setHoverActivatedDocOrSummary = {g_setHoverActivatedDocOrSummary}
              t_StateMachineStateId = {undefined}                           t_SetStateMachineStateId = {undefined}
              t_start_doc_json = {undefined}                                t_middle_doc_json = {undefined}
              t_sent_end_doc_json = {undefined}                             t_submit_doc_json = {undefined}
              t_start_summary_json = {undefined}                            t_middle_summary_json = {undefined}
              t_sent_end_summary_json = {undefined}                         t_submit_summary_json = {undefined}
              t_state_messages = {undefined}
            />
   )
   /********************************************************************************/ 




  
}

export default GuidedAnnotation
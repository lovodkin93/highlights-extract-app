import { useState, useEffect, useRef } from 'react';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import ResponsiveAppBar from './ResponsiveAppBar';
import { getGuidedAnnotationToastTitle, getGuidedAnnotationToastText, GuidedAnnotationToast, guidingAnnotationAlert } from './GuidedAnnotation_utils';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';
import { ArrowBackIosTwoTone, ArrowForwardIosTwoTone } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';

import Fab from '@mui/material/Fab';
// import Card from '@mui/material/Card';
import { Card } from 'react-bootstrap';

import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { borderColor } from '@mui/system';


import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import { ChevronLeft, ChevronRight, SendFill } from 'react-bootstrap-icons';


// import Card from 'react-bootstrap/Card'
// import { Container, Row, Col } from 'react-bootstrap';


const Annotation = ({isTutorial, isGuidedAnnotation, task_id, 
                    doc_json, summary_json, 
                    all_lemma_match_mtx, important_lemma_match_mtx, doc_paragraph_breaks,
                    StateMachineState, SetStateMachineState,
                    handleErrorOpen, isPunct,
                    toggleSummarySpanHighlight, toggleDocSpanHighlight, 
                    boldState, boldStateHandler,
                    SubmitHandler,
                    CurrSentInd,
                    InfoMessage,
                    MachineStateHandlerWrapper,
                    AlignmentCount, SetAlignmentCount,
                    oldAlignmentState, oldAlignmentStateHandler,
                    hoverHandler,
                    DocOnMouseDownID, SetDocOnMouseDownID, SummaryOnMouseDownID, SetSummaryOnMouseDownID,
                    setDocOnMouseDownActivated, docOnMouseDownActivated, setSummaryOnMouseDownActivated, summaryOnMouseDownActivated, setHoverActivatedId, setHoverActivatedDocOrSummary,
                    g_StateMachineStateIndex,
                    guidingAnnotationAlertText, guidingAnnotationAlertTitle, guidingAnnotationAlertType, closeGuidingAnnotationAlert,
                    t_StateMachineStateId
                   }) => {



  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);

  const [summaryOnMouseDownInCorrectSent, setSummaryOnMouseDownInCorrectSent] = useState(true)
  const [ctrlButtonDown, setCtrlButtonDown] = useState(false)
  const [toastVisible, setToastVisible] = useState(true)

  const nextButtonText = () => {
    if(StateMachineState==="START"){return "START";}
    if(StateMachineState==="ANNOTATION"){return "CONFIRM";}
    if(StateMachineState==="SENTENCE START"){return "CONFIRM";}
    if(StateMachineState==="SENTENCE END"){return "NEXT SENTENCE";}
    if(StateMachineState==="SUMMARY END"){return "SUBMIT";}
    if(StateMachineState==="REVISE CLICKED"){return "CONFIRM";}
  }

  const getInfoAlertTitle = () => {
    if(StateMachineState==="ANNOTATION"){return "Find Alignments"}
    if(StateMachineState==="SENTENCE START"){return "Find Alignments";}
    if(StateMachineState==="SENTENCE END"){return "Finished Sentence";}
    if(StateMachineState==="SUMMARY END"){return "Finished";}
    if(StateMachineState==="REVISE HOVER"){return "Choose Alignment";}
    if(StateMachineState==="REVISE CLICKED"){return "Adjust Alignments";}
  }

  const InfoAlert = (InfoMessage) => {
    return (
      <Alert variant="info">
        <Alert.Heading>{getInfoAlertTitle()}</Alert.Heading>
        <p className="mb-0">
          {InfoMessage}
        </p>
      </Alert>
    )}
      







  const DocOnMouseDownHandler = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      SetDocOnMouseDownID(tkn_id);
    }
  }

  const SummaryOnMouseDownHandler = (tkn_id) => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } 
    else if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id > CurrSentInd}).length !== 0)) {
      handleErrorOpen({ msg : "Span chosen cannot be from future sentences. Only from current or past sentences" });
      setSummaryOnMouseDownInCorrectSent(false);
    } 
    else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))){ // check if span chosen is from the correct sentence first.
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
      setSummaryOnMouseDownInCorrectSent(false);
    } 
    else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
      SetSummaryOnMouseDownID(tkn_id);
    }
  }

  const DocOnMouseUpHandler = () => {
    if (StateMachineState === "START"){ // during START state no highlighting
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    } else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState)) {
        const chosen_IDs = doc_json.filter((word) => {return word.span_alignment_hover}).map((word) => {return word.tkn_id})
        if (ctrlButtonDown) {
          toggleDocSpanHighlight({tkn_ids:chosen_IDs, turn_off:true});
        } else {
            toggleDocSpanHighlight({tkn_ids:chosen_IDs, turn_on:true});
        }
        SetDocOnMouseDownID("-1"); 
    }
  }

  const SummaryOnMouseUpHandler = () => {
    if (StateMachineState == "START"){ // during start state no clicking is needed
      handleErrorOpen({ msg : "Can't highlight words yet. Press \"START\" to begin."});
    }
    else if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.span_alignment_hover && word.sent_id > CurrSentInd}).length !== 0)) {
      handleErrorOpen({ msg : "Span chosen cannot be from future sentences. Only from current or past sentences" });
    } 
    else if ((summary_json.filter((word) => {return word.span_alignment_hover && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))){ // check if span chosen is from the correct sentence first.
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } 
    else if (["ANNOTATION", "SENTENCE END", "SUMMARY END", "REVISE CLICKED", "SENTENCE START"].includes(StateMachineState) && summaryOnMouseDownInCorrectSent){   
      const chosen_IDs = summary_json.filter((word) => {return word.span_alignment_hover}).map((word) => {return word.tkn_id})
      if (ctrlButtonDown) {
        toggleSummarySpanHighlight({tkn_ids:chosen_IDs, turn_off:true});
      } else {
        toggleSummarySpanHighlight({tkn_ids:chosen_IDs, turn_on:true});
      }   
      SetSummaryOnMouseDownID("-1");
     } 
     else {
      if (summaryOnMouseDownInCorrectSent && StateMachineState !== "REVISE HOVER") {console.log(`AVIVSL: state is ${StateMachineState}`); alert(`state not defined yet! state: ${StateMachineState}`);}
    }

    // reset the states
    setSummaryOnMouseDownInCorrectSent(true)
    SetSummaryOnMouseDownID("-1")
  }



  const DocMouseClickHandlerWrapper = (tkn_id) => {
    if ((StateMachineState === "REVISE HOVER") && (doc_json.filter((word) => {return word.tkn_id === tkn_id})[0].alignment_id.length > 0)) {
        MachineStateHandlerWrapper({clickedWordInfo:["doc", tkn_id]});
    }
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
  if ((StateMachineState === "REVISE HOVER") && (summary_json.filter((word) => {return word.tkn_id === tkn_id})[0].alignment_id.length > 0)) {
        MachineStateHandlerWrapper({clickedWordInfo:["summary", tkn_id]});
    }
  }

  // for the "REVISE HOVER" state
  const hoverHandlerWrapper = ({inOrOut, curr_alignment_id, tkn_id, isSummary}) => {
    if ((StateMachineState === "REVISE CLICKED") && (summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id > CurrSentInd}).length !== 0)){
      return
    } else if ((summary_json.filter((word) => {return word.tkn_id === tkn_id && word.sent_id !== CurrSentInd}).length !== 0) && !(["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState))) {
      return
    }
    hoverHandler({inOrOut, curr_alignment_id, tkn_id, isSummary});
  }

  hoverHandlerWrapper.defaultProps = {
    tkn_id: -1,
    isSummary: false
  }


  const get_range = (start_i, end_i) => {
    return [...Array(end_i - start_i + 1).keys()].map(x => x + start_i)
  }

  const getDocText = () => {
    if (!isTutorial || t_StateMachineStateId !== 7){
      return doc_json.map((word_json, index) => (
                <DocWord key={index} word_json={word_json} doc_paragraph_breaks={doc_paragraph_breaks} StateMachineState={StateMachineState} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} DocOnMouseDownHandler={DocOnMouseDownHandler} DocOnMouseUpHandler={DocOnMouseUpHandler} setDocOnMouseDownActivated={setDocOnMouseDownActivated} docOnMouseDownActivated={docOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId} ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/>
              ))
    } else {
        const start_1 = 0;
        const end_1 = 13;
        const start_2 = end_1+1;
        const end_2 = 104;
        const start_3 = end_2+1;
        const end_3 = 108;
        const start_4 = end_3+1;
        const end_4 = 417;
        const span_groups = [doc_json.filter((word, ind) => {return ind>=start_1 && ind <=end_1}), doc_json.filter((word, ind) => {return ind>=start_2 && ind <=end_2}), doc_json.filter((word, ind) => {return ind>=start_3 && ind <=end_3}), doc_json.filter((word, ind) => {return ind>=start_4 && ind <=end_4})]
        
        return span_groups.map((summary_words, index) => 
                  <div className={`${([0,2].includes(index)) ?  'with-glow': ''}`}>
                      {summary_words.map((word_json, index) => (
                          <DocWord key={index} word_json={word_json} doc_paragraph_breaks={doc_paragraph_breaks} StateMachineState={StateMachineState} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} DocOnMouseDownHandler={DocOnMouseDownHandler} DocOnMouseUpHandler={DocOnMouseUpHandler} setDocOnMouseDownActivated={setDocOnMouseDownActivated} docOnMouseDownActivated={docOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId} ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/>
                        ))}
                  </div>
                )
    }
  }





  const getSummaryText = () => {

    // when rebooting
    if (summary_json.length === 0){
      return
    }

    const max_sent_id = summary_json.map((word) =>{return word.sent_id}).reduce(function(a, b) {return Math.max(a, b)}, -Infinity);
    const summary_per_sent_id = [...Array(max_sent_id+1).keys()].map((sent_id) => {return summary_json.filter((word) => {return word.sent_id===sent_id})})
    return summary_per_sent_id.map((summary_words, index) => 
                                                      <div>
                                                        <p  className={`${(index===CurrSentInd) ?  'bordered_sent': ''} ${(isTutorial && t_StateMachineStateId===4 && index===CurrSentInd) ? 'with-glow' : ''}`}>
                                                          {summary_words.map((word_json, index) => (
                                                            <SummaryWord key={index} word_json={word_json}  StateMachineState={StateMachineState} SummaryMouseClickHandlerWrapper={SummaryMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} SummaryOnMouseDownHandler={SummaryOnMouseDownHandler} SummaryOnMouseUpHandler={SummaryOnMouseUpHandler} setSummaryOnMouseDownActivated={setSummaryOnMouseDownActivated} summaryOnMouseDownActivated={summaryOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId}  ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/> 
                                                            ))}
                                                        </p>
                                                        <span className="br-class"></span>
                                                      </div>
                                                      )
  }

  const getResponsiveAppBarTitle = () => {
    if (isTutorial){
      return "Tutorial";
    } else if (isGuidedAnnotation) {
      return "Guided Annotation";
    } else {
      return "Annotation";
    }
  }
  

/************ TO MAKE SURE THAT WHEN DOC TOO LONG THE SUMMARY IS ALWAYS VISIBLE ****************************** */
const containerRef = useRef(null)
const prevIsVisibleFullySummary = useRef(false)
const [ isVisibleFullySummary, setIsVisibleFullySummary ] = useState(true)

const callbackFunction = (entries) => {
  const [ entry ] = entries
  prevIsVisibleFullySummary.current = isVisibleFullySummary;
  setIsVisibleFullySummary(entry.isIntersecting)
}

const options = {
  root: null,
  rootMargin: "0px",
  threshold:0.01
}

useEffect(() => {
  
  const observer = new IntersectionObserver(callbackFunction, options)
  if (containerRef.current) observer.observe(containerRef.current)
  
  return () => {
    if(containerRef.current) observer.unobserve(containerRef.current)
  }
}, [containerRef, options])
/************************************************************************************************************* */


useEffect(() => {
  if (isTutorial){
    console.log(`t_doc_json is:`)
    console.log(doc_json)
  }
}, []);
// to make sure the guided annotation guiding messages start with something
  // useEffect(() => {
  //   console.log(`StateMachineState is: ${StateMachineState}`)
  //   if (StateMachineState==="START") {
  //     setGuidedAnnotationMessage("To begin, press the \"START\" button.")
  //   }
  // }, []);

  // reset clickings between states
  useEffect(() => {
    SetDocMouseDownStartID("-1");
    SetDocMouseclicked(false);
    SetSummaryMouseDownStartID("-1");
    SetSummaryMouseclicked(false);
  }, [StateMachineState]);
  
  return (
      <Container onKeyDown={(event) => {if (event.ctrlKey) {setCtrlButtonDown(true)}}}
                 onKeyUp={() => {setCtrlButtonDown(false)}} 
                 tabIndex="0"
                 className='annotation-container'
      >
        <Row className='annotation-row' ref={containerRef}>
          <Col>
            <ResponsiveAppBar
                  title={getResponsiveAppBarTitle()} 
                  StateMachineState = {StateMachineState} 
                  MachineStateHandlerWrapper={MachineStateHandlerWrapper}
                  boldState={boldState}
                  boldStateHandler={boldStateHandler}
                  oldAlignmentState={oldAlignmentState}
                  oldAlignmentStateHandler={oldAlignmentStateHandler}
                  g_StateMachineStateIndex = {g_StateMachineStateIndex}
                  t_StateMachineStateId = {t_StateMachineStateId}
            />
            {(InfoMessage !== "" && !isTutorial) && (InfoAlert(InfoMessage))}
          </Col>
        </Row>

        {(isGuidedAnnotation && guidingAnnotationAlertText!=="") && (
          guidingAnnotationAlert(guidingAnnotationAlertText, guidingAnnotationAlertTitle, guidingAnnotationAlertType, closeGuidingAnnotationAlert)
        )}
        
        {/* {isGuidedAnnotation && (
          <button style={{position:"fixed", left:"0", top:"8%", height:"5%", zIndex:"1"}} type="button" className="btn btn-primary btn-lg" onClick={() => setToastVisible(true)}></button>
        )} */}
        {isGuidedAnnotation && (
              GuidedAnnotationToast(toastVisible, setToastVisible, g_StateMachineStateIndex)
        )}
        <Row className='annotation-row' id={`${(InfoMessage === "") ? 'doc-summary-row': ''}`}>
          <Col md={ 8 }>
            <Card border="secondary" bg="light"  id="doc-text">
                <Card.Header>Document</Card.Header>
                <Card.Body>
                  {getDocText()}
                  {/* {doc_json.map((word_json, index) => (
                      <DocWord key={index} word_json={word_json} doc_paragraph_breaks={doc_paragraph_breaks} StateMachineState={StateMachineState} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} DocOnMouseDownHandler={DocOnMouseDownHandler} DocOnMouseUpHandler={DocOnMouseUpHandler} setDocOnMouseDownActivated={setDocOnMouseDownActivated} docOnMouseDownActivated={docOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId} ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/>
                    ))}; */}
                </Card.Body>
              </Card>
          </Col>

          <Col md={4}>
            <div id={`${(isVisibleFullySummary) ?  '': 'fixed-summary-and-buttons'}`}>
            <Row>
              <Col>
                <Card border="secondary" bg="light" id="summary-text">
                  <Card.Header>Summary</Card.Header>
                  <Card.Body>
                    {getSummaryText()}
                    {/* {summary_json.map((word_json, index) => (
                      <SummaryWord key={index} word_json={word_json}  StateMachineState={StateMachineState} SummaryMouseClickHandlerWrapper={SummaryMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} SummaryOnMouseDownHandler={SummaryOnMouseDownHandler} SummaryOnMouseUpHandler={SummaryOnMouseUpHandler} setSummaryOnMouseDownActivated={setSummaryOnMouseDownActivated} summaryOnMouseDownActivated={summaryOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId}  ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/> 
                    ))}; */}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-md-center">
                {["SUMMARY END", "SENTENCE END", "ANNOTATION", "SENTENCE START"].includes(StateMachineState) && (
                  <Col>
                    <button type="button" className={`btn btn-dark btn-lg ${(isTutorial && t_StateMachineStateId===11) ? 'with-glow' : ''}`} onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER"})}>REVISE</button>
                  </Col>
                )}

                {StateMachineState === "REVISE HOVER" && (
                  <Col>
                    <button type="button" className={`btn btn-success btn-lg ${(isTutorial && t_StateMachineStateId===13) ? 'with-glow' : ''}`} onClick={() => MachineStateHandlerWrapper({forceState:"FINISH REVISION"})}>FINISH</button>
                  </Col>
                )}

              {StateMachineState === "REVISE CLICKED" && (
                  <Col md={{span:4, offset:0}}>
                    <button type="button" className={`btn btn-danger btn-lg ${(isTutorial && t_StateMachineStateId===12) ? 'with-glow' : ''}`} onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER", isBackBtn:true })}>
                    <ChevronLeft className="button-icon"/>
                    BACK
                    </button>
                  </Col>
                )}

              {!["REVISE HOVER", "SUMMARY END", "SENTENCE END", "START"].includes(StateMachineState) && (
                  <Col md={{span:5, offset:3}}>
                    <button type="button" className={`btn btn-primary btn-lg right-button ${(isTutorial && [5,12].includes(t_StateMachineStateId)) ? 'with-glow' : ''}`} onClick={MachineStateHandlerWrapper}>
                      {nextButtonText()}
                      <ChevronRight className="button-icon"/>
                    </button>
                  </Col>
              )}

              {StateMachineState === "START"  && (
                    <Col md={{span:3, offset:9}}>
                      <button type="button" className={`btn btn-primary btn-lg right-button ${(isGuidedAnnotation || isTutorial) ? 'with-glow' : ''}`} onClick={MachineStateHandlerWrapper}>
                        {nextButtonText()}
                      </button>
                    </Col>
                )}

              {StateMachineState === "SENTENCE END"  && (
                    <Col md={{span:7, offset:1}}>
                      <button type="button" className={`btn btn-success btn-lg right-button ${(isTutorial && t_StateMachineStateId===14) ? 'with-glow' : ''}`} onClick={MachineStateHandlerWrapper}>
                        {nextButtonText()}
                        {StateMachineState !== "START" && (<ChevronRight className="button-icon"/>) }
                      </button>
                    </Col>
                )}

              {StateMachineState === "SUMMARY END" && (
                <Col md={{span:5, offset:3}}>
                  <button type="button" className={`btn btn-success btn-lg right-button ${(isTutorial && t_StateMachineStateId===15) ? 'with-glow' : ''}`} onClick={SubmitHandler}>
                    {nextButtonText()}
                    {StateMachineState !== "START" && (<SendFill className="button-icon"/>) }
                  </button>
                </Col>
              )}


            </Row>
            </div>
          </Col>
        </Row>
      </Container>
  )
}

export default Annotation
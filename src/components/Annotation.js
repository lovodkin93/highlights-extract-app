import { useState, useEffect, useRef } from 'react';
import DocWord from './DocWord';
import SummaryWord from './SummaryWord';
import ResponsiveAppBar from './ResponsiveAppBar';
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


import Toast from 'react-bootstrap/Toast'
import ToastHeader from 'react-bootstrap/ToastHeader'
import ToastBody from 'react-bootstrap/ToastBody'
import ToastContainer from 'react-bootstrap/ToastContainer'


// import Card from 'react-bootstrap/Card'
// import { Container, Row, Col } from 'react-bootstrap';


const Annotation = ({isGuidedAnnotation, task_id, 
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
                    guidedAnnotationMessage, setGuidedAnnotationMessage
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

  const nextButtonID = () => {
    if(StateMachineState==="START"){return "state-START";}
    if(StateMachineState==="ANNOTATION"){return "state-ANNOTATION";}
    if(StateMachineState==="SENTENCE START"){return "state-SENTENCE-START";}
    if(StateMachineState==="SENTENCE END"){return "state-SENTENCE-END";}
    if(StateMachineState==="SUMMARY END"){return "state-SUMMARY-END";}
    if(StateMachineState==="REVISE CLICKED"){return "state-REVISE-CLICKED";}
  };


  // const Alert = React.forwardRef(function Alert(props, ref) {
  //   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  // });

  const getGuideAlertTitle = () => {
    if(StateMachineState==="ANNOTATION"){return "Find Alignments"}
    if(StateMachineState==="SENTENCE START"){return "Find Alignments";}
    if(StateMachineState==="SENTENCE END"){return "Finished Sentence";}
    if(StateMachineState==="SUMMARY END"){return "Finished";}
    if(StateMachineState==="REVISE HOVER"){return "Choose Alignment";}
    if(StateMachineState==="REVISE CLICKED"){return "Adjust Alignments";}
  }


  const getGuidingMessageTitle = () => {
    if(StateMachineState==="START"){return "START"}
  }


  const GuideAlert = (InfoMessage) => {
    return (
      <Alert variant="info">
        <Alert.Heading>{getGuideAlertTitle()}</Alert.Heading>
        <p className="mb-0">
          {InfoMessage}
        </p>
      </Alert>
    )}

  
    const GuidedAnnotationToast = () => {
      return (
        <ToastContainer className="p-3" position="top-start" style={{zIndex:"1"}}>
          <Toast onClose={() => setToastVisible(false)} show={toastVisible} className="d-inline-block m-1" bg='warning'>
            <Toast.Header  style={{fontSize:"larger"}}>
              <strong className="me-auto">{getGuidingMessageTitle()}</strong>
            </Toast.Header>
            <Toast.Body style={{fontSize:"larger", fontFamily:"sans-serif"}}>
              {guidedAnnotationMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
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





  const getSummaryText = () => {

    // when rebooting
    if (summary_json.length === 0){
      return
    }

    const max_sent_id = summary_json.map((word) =>{return word.sent_id}).reduce(function(a, b) {return Math.max(a, b)}, -Infinity);
    const summary_per_sent_id = [...Array(max_sent_id+1).keys()].map((sent_id) => {return summary_json.filter((word) => {return word.sent_id===sent_id})})
    return summary_per_sent_id.map((summary_words, index) => 
                                                      <div>
                                                        <p  className={`${(index===CurrSentInd) ?  'bordered_sent': ''}`}>
                                                          {summary_words.map((word_json, index) => (
                                                            <SummaryWord key={index} word_json={word_json}  StateMachineState={StateMachineState} SummaryMouseClickHandlerWrapper={SummaryMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} SummaryOnMouseDownHandler={SummaryOnMouseDownHandler} SummaryOnMouseUpHandler={SummaryOnMouseUpHandler} setSummaryOnMouseDownActivated={setSummaryOnMouseDownActivated} summaryOnMouseDownActivated={summaryOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId}  ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/> 
                                                            ))}
                                                        </p>
                                                        <span className="br-class"></span>
                                                      </div>
                                                      )
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



// to make sure the guided annotation guiding messages start with something
  useEffect(() => {
    console.log(`StateMachineState is: ${StateMachineState}`)
    if (StateMachineState==="START") {
      console.log("guidedAnnotationMessage is: ")
      console.log(guidedAnnotationMessage)
      setGuidedAnnotationMessage("To begin, press the \"START\" button.")
    }
  }, []);

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
                  title={isGuidedAnnotation ? "Guided Annotation" : "Annotation"} 
                  StateMachineState = {StateMachineState} 
                  MachineStateHandlerWrapper={MachineStateHandlerWrapper}
                  boldState={boldState}
                  boldStateHandler={boldStateHandler}
                  oldAlignmentState={oldAlignmentState}
                  oldAlignmentStateHandler={oldAlignmentStateHandler}
            />
            {InfoMessage !== "" && (GuideAlert(InfoMessage))}
          </Col>
        </Row>
        {/* {isGuidedAnnotation && (
          <button style={{position:"fixed", left:"0", top:"8%", height:"5%", zIndex:"1"}} type="button" className="btn btn-primary btn-lg" onClick={() => setToastVisible(true)}></button>
        )} */}
        {isGuidedAnnotation && (
              GuidedAnnotationToast()
        )}
        <Row className='annotation-row' id={`${(InfoMessage === "") ? 'doc-summary-row': ''}`}>
          <Col md={ 8 }>
            <Card border="secondary" bg="light"  id="doc-text">
                <Card.Header>Document</Card.Header>
                <Card.Body>
                  {doc_json.map((word_json, index) => (
                      <DocWord key={index} word_json={word_json} doc_paragraph_breaks={doc_paragraph_breaks} StateMachineState={StateMachineState} DocMouseClickHandlerWrapper={DocMouseClickHandlerWrapper} hoverHandlerWrapper={hoverHandlerWrapper} DocOnMouseDownHandler={DocOnMouseDownHandler} DocOnMouseUpHandler={DocOnMouseUpHandler} setDocOnMouseDownActivated={setDocOnMouseDownActivated} docOnMouseDownActivated={docOnMouseDownActivated} setHoverActivatedId={setHoverActivatedId} ctrlButtonDown={ctrlButtonDown} setHoverActivatedDocOrSummary={setHoverActivatedDocOrSummary}/>
                    ))};
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
                    <button type="button" className="btn btn-dark btn-lg" onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER"})}>REVISE</button>
                  </Col>
                )}

                {StateMachineState === "REVISE HOVER" && (
                  <Col>
                    <button type="button" className="btn btn-success btn-lg" onClick={() => MachineStateHandlerWrapper({forceState:"FINISH REVISION"})}>FINISH</button>
                  </Col>
                )}

              {StateMachineState === "REVISE CLICKED" && (
                  <Col md={{span:4, offset:0}}>
                    <button type="button" className="btn btn-danger btn-lg" onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER", isBackBtn:true })}>
                    <ChevronLeft className="button-icon"/>
                    BACK
                    </button>
                  </Col>
                )}

              {!["REVISE HOVER", "SUMMARY END", "SENTENCE END", "START"].includes(StateMachineState) && (
                  <Col md={{span:5, offset:3}}>
                    <button type="button" className="btn btn-primary btn-lg right-button" onClick={MachineStateHandlerWrapper}>
                      {nextButtonText()}
                      <ChevronRight className="button-icon"/>
                    </button>
                  </Col>
              )}

              {StateMachineState === "START"  && (
                    <Col md={{span:3, offset:9}}>
                      <button type="button" className="btn btn-primary btn-lg right-button" onClick={MachineStateHandlerWrapper}>
                        {nextButtonText()}
                      </button>
                    </Col>
                )}

              {StateMachineState === "SENTENCE END"  && (
                    <Col md={{span:7, offset:1}}>
                      <button type="button" className="btn btn-success btn-lg right-button" onClick={MachineStateHandlerWrapper}>
                        {nextButtonText()}
                        {StateMachineState !== "START" && (<ChevronRight className="button-icon"/>) }
                      </button>
                    </Col>
                )}

              {StateMachineState === "SUMMARY END" && (
                <Col md={{span:5, offset:3}}>
                  <button type="button" className="btn btn-success btn-lg right-button" onClick={SubmitHandler}>
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
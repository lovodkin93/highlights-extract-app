import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastHeader from 'react-bootstrap/ToastHeader'
import ToastBody from 'react-bootstrap/ToastBody'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Carousel from 'react-bootstrap/Carousel'
  
  
const getGuidedAnnotationToastTitle = (g_StateMachineStateIndex) => {
if(g_StateMachineStateIndex===0){return "START"}
if(g_StateMachineStateIndex===1.0){return "CHOOSE SUMMARY SPAN"}
if(g_StateMachineStateIndex===1.1){return "BOLDING OPTIONS"}
if(g_StateMachineStateIndex===1.2){return "CHOOSE DOCUMENT SPAN"}

}

const getGuidedAnnotationToastText = (g_StateMachineStateIndex) => {
if(g_StateMachineStateIndex===0){return <p style={{margin:"0"}}>To begin, press the "START" button</p>}
if(g_StateMachineStateIndex===1.0){return <p style={{margin:"0"}}>Choose a summary span from the first sentence to align (by left-clicking at the beginning of the span and leaving the click at its end).<hr></hr>Make sure the span you choose <u>describes at least one scene</u> and that it is <u>not too long</u>.</p>}
if(g_StateMachineStateIndex===1.1){return <p style={{margin:"0"}}>Notice how document words related to the words in the highlighted span are in bold, to help you find the alignments.<hr></hr>When nothing is highlighted, all the doc words relating to all the current sentence's words are in bold.<hr></hr>At any given time, you can adust the level of bolding (none, highlighted span or full sentence), by playing with the red slider in the top-right corner of the UI. Try it before continuing.</p>}
if(g_StateMachineStateIndex===1.2){return <p style={{margin:"0"}}>Great! Now that you got familiarized with the bolding feature, let's continue with that annotation.<hr></hr>Choose a span from the document aligning to the span you chose from the summary. Make sure you choose a span that covers all the information described in the summary span, and only it.</p>}
}

const GuidedAnnotationToast = (toastVisible, setToastVisible, g_StateMachineStateIndex) => {
    return (
      <ToastContainer className="p-3" position="middle-center" style={{zIndex:"1"}}>
        <Toast onClose={() => setToastVisible(false)} show={toastVisible} className="d-inline-block m-1" bg='danger'>
          <Toast.Header  style={{ color:"black", fontSize:"x-large"}}>
            <strong className="me-auto">{getGuidedAnnotationToastTitle(g_StateMachineStateIndex)}</strong>
            <small>{g_StateMachineStateIndex}</small>
          </Toast.Header>
          <Toast.Body style={{color:"white", fontSize:"large", fontFamily:"sans-serif"}}>
            {getGuidedAnnotationToastText(g_StateMachineStateIndex)}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    )}







const summarySpanIsOk = (g_StateMachineStateIndex, tkn_ids) => {
    if(g_StateMachineStateIndex===1.0){
        if (tkn_ids.filter((tkn_id) => {return tkn_id>20}).length !== 0) {
            return "too long"
        } else if (Array.from(Array(20).keys()).filter((tkn_id) => {return !tkn_ids.includes(tkn_id)}).length !== 0){
            return "too short"
        } else {
            return "good"
        }
    }
}


const guidingAnnotationAlert = (guidingAnnotationAlertText, guidingAnnotationAlertTitle, guidingAnnotationAlertType, closeGuidingAnnotationAlert) => {
    return (
        <Modal 
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            id={`guidingAnnotationAlert-${guidingAnnotationAlertType}`}
            centered
            show={true} 
            onHide={closeGuidingAnnotationAlert}
            >
            <Modal.Header className={`alert-${guidingAnnotationAlertType} alert-heading h4`} style={{ marginBottom:"0"}} closeButton>
                <Modal.Title style={{fontSize:"xx-large"}}>{guidingAnnotationAlertTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body  style={{fontSize:"x-large"}} className={`alert-${guidingAnnotationAlertType}`}>{guidingAnnotationAlertText}</Modal.Body>
      </Modal>
      ); 
}





const g_StateMachineStateIndexHandler = (g_StateMachineStateIndex, g_setStateMachineStateIndex) => {
    console.log(`g_StateMachineStateIndex is ${g_StateMachineStateIndex}`)
    if(g_StateMachineStateIndex===0) {
        g_setStateMachineStateIndex(1.0);
    } else if (g_StateMachineStateIndex===1.0) {
        g_setStateMachineStateIndex(1.1)
    } else if (g_StateMachineStateIndex===1.1) {
        g_setStateMachineStateIndex(1.2)
    }
}



export { getGuidedAnnotationToastTitle, getGuidedAnnotationToastText, GuidedAnnotationToast, summarySpanIsOk, guidingAnnotationAlert, g_StateMachineStateIndexHandler }

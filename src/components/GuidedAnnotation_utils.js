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
if(g_StateMachineStateIndex===1.1){return "CHOOSE DOCUMENT SPAN"}

}

const getGuidedAnnotationToastText = (g_StateMachineStateIndex) => {
if(g_StateMachineStateIndex===0){return <p style={{margin:"0"}}>To begin, press the "START" button</p>}
if(g_StateMachineStateIndex===1.0){return <p style={{margin:"0"}}>Choose a summary span from the first sentence to align (by left-clicking at the beginning of the span and leaving the click at its end).<hr></hr>Make sure the span you choose <b>describes at least one scene</b> and that it is <b>not too long</b>.</p>}
if(g_StateMachineStateIndex===1.1){return <p style={{margin:"0"}}>Now choose a span from the document aligning to the span you chose from the summary. Make sure you choose a span that covers all the information described in the summary span, and only it.</p>}
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
        
        
        
        
        // <Modal       
        // // fullscreen={true}
        // show={true} onHide={closeGuidingAnnotationAlert}
        // >
        // <Alert style={{position:"fixed", fontSize:"x-large"}} variant={guidingAnnotationAlertType} onClose={closeGuidingAnnotationAlert} dismissible>
        //   <Alert.Heading style={{fontSize:"xx-large"}}>{guidingAnnotationAlertTitle}</Alert.Heading>
        //   <p>
        //     {guidingAnnotationAlertText}
        //   </p>
        // </Alert>
        // </Modal>

      ); 
}



export { getGuidedAnnotationToastTitle, getGuidedAnnotationToastText, GuidedAnnotationToast, summarySpanIsOk, guidingAnnotationAlert }

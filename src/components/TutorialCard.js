import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import { t_StateMachineStateIdHandler, getTutorialCardTitle, getTutorialCardText } from './Tutorial_utils'
import { Link } from 'react-router-dom';



const TutorialCard = ({t_StateMachineStateId, t_SetStateMachineStateId, t_state_messages, SetStateMachineState, 
                      setDocJson, t_start_doc_json, t_middle_doc_json, t_sent_end_doc_json, t_submit_doc_json,
                      setSummaryJson, t_start_summary_json, t_middle_summary_json, t_sent_end_summary_json, t_submit_summary_json,
                      SetCurrSentInd,
                      MachineStateHandlerWrapper}) => {
    return (
        <Card className={`${(t_StateMachineStateId==0) ? 'tutorial-card-intro' : ''} 
                          ${(t_StateMachineStateId==`15`) ? 'tutorial-card-end' : ''}
                          ${(![0,15].includes(t_StateMachineStateId)) ? 'tutorial-card-not-intro' : ''}`}
                            bg="info" border="primary" style={{ width: '30%' }}>
          <Card.Body>
            <Card.Title className='tutorial-title'>{getTutorialCardTitle(t_state_messages,t_StateMachineStateId)}</Card.Title>
            <Card.Text>
              {getTutorialCardText(t_state_messages,t_StateMachineStateId)}
            </Card.Text>
              {(t_StateMachineStateId === 0) && (
                <DropdownButton className="tutorial-drop-down-button" size="lg" variant="secondary" drop="end" id="dropdown-button-drop-end" title="Sections">
                  {t_state_messages.map((t_state) => (
                      <Dropdown.Item as="button" onClick={() => {t_StateMachineStateIdHandler({newStateId:t_state.state_cnt, SetStateMachineState:SetStateMachineState, t_SetStateMachineStateId:t_SetStateMachineStateId, t_StateMachineStateId:t_StateMachineStateId, 
                                                                      setDocJson:setDocJson, t_start_doc_json:t_start_doc_json, t_middle_doc_json:t_middle_doc_json, t_sent_end_doc_json:t_sent_end_doc_json, t_submit_doc_json:t_submit_doc_json,
                                                                      setSummaryJson:setSummaryJson, t_start_summary_json:t_start_summary_json, t_middle_summary_json:t_middle_summary_json, t_sent_end_summary_json:t_sent_end_summary_json, t_submit_summary_json:t_submit_summary_json,
                                                                      SetCurrSentInd:SetCurrSentInd,
                                                                      MachineStateHandlerWrapper:MachineStateHandlerWrapper}
                                                                      )}}
                        >
                      {t_state.title}
                      </Dropdown.Item>
                    ))}
              </DropdownButton>
              )}
                {(t_StateMachineStateId !== 0) && (
                <Button style={{marginRight:"1%"}} className="btn btn-warning btn-lg" onClick={() => {t_StateMachineStateIdHandler({newStateId:0, SetStateMachineState:SetStateMachineState, t_SetStateMachineStateId:t_SetStateMachineStateId, t_StateMachineStateId:t_StateMachineStateId, 
                                                                                                      setDocJson:setDocJson, t_start_doc_json:t_start_doc_json, t_middle_doc_json:t_middle_doc_json, t_sent_end_doc_json:t_sent_end_doc_json, t_submit_doc_json:t_submit_doc_json,
                                                                                                      setSummaryJson:setSummaryJson, t_start_summary_json:t_start_summary_json, t_middle_summary_json:t_middle_summary_json, t_sent_end_summary_json:t_sent_end_summary_json, t_submit_summary_json:t_submit_summary_json,
                                                                                                      SetCurrSentInd:SetCurrSentInd,
                                                                                                      MachineStateHandlerWrapper:MachineStateHandlerWrapper})}}
                >
                  Back to Intro
              </Button>
              )}
              {(t_StateMachineStateId !== 0) && (
                <Button className="btn btn-dark btn-lg" onClick={() => {t_StateMachineStateIdHandler({newStateId:t_StateMachineStateId-1, SetStateMachineState:SetStateMachineState, t_SetStateMachineStateId:t_SetStateMachineStateId, t_StateMachineStateId:t_StateMachineStateId, 
                                                                                                      setDocJson:setDocJson, t_start_doc_json:t_start_doc_json, t_middle_doc_json:t_middle_doc_json, t_sent_end_doc_json:t_sent_end_doc_json, t_submit_doc_json:t_submit_doc_json,
                                                                                                      setSummaryJson:setSummaryJson, t_start_summary_json:t_start_summary_json, t_middle_summary_json:t_middle_summary_json, t_sent_end_summary_json:t_sent_end_summary_json, t_submit_summary_json:t_submit_summary_json,
                                                                                                      SetCurrSentInd:SetCurrSentInd,
                                                                                                      MachineStateHandlerWrapper:MachineStateHandlerWrapper})}}
                >
                  Back
              </Button>
              )}

            {(t_StateMachineStateId !== 15) && (
                <Button className="btn btn-primary btn-lg right-button" onClick={() => {t_StateMachineStateIdHandler({newStateId:t_StateMachineStateId+1, SetStateMachineState:SetStateMachineState, t_SetStateMachineStateId:t_SetStateMachineStateId, t_StateMachineStateId:t_StateMachineStateId, 
                                                                                                      setDocJson:setDocJson, t_start_doc_json:t_start_doc_json, t_middle_doc_json:t_middle_doc_json, t_sent_end_doc_json:t_sent_end_doc_json, t_submit_doc_json:t_submit_doc_json,
                                                                                                      setSummaryJson:setSummaryJson, t_start_summary_json:t_start_summary_json, t_middle_summary_json:t_middle_summary_json, t_sent_end_summary_json:t_sent_end_summary_json, t_submit_summary_json:t_submit_summary_json,
                                                                                                      SetCurrSentInd:SetCurrSentInd,
                                                                                                      MachineStateHandlerWrapper:MachineStateHandlerWrapper})}}
                >
                  Next
              </Button>
            )}
            {(t_StateMachineStateId === 15) && (
              <Link to="/guidedAnnotation">
                <Button className="btn btn-success btn-lg right-button">
              To Guided Annotation
              </Button>
              </Link>
            )}
          </Card.Body>
        </Card>
    )
}


export { TutorialCard }

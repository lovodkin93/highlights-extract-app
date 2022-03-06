import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocWord from './DocWord'
import SummaryWord from './SummaryWord'
import Header from './Header'
import ResponsiveAppBar from './ResponsiveAppBar'
import { DocMouseClickHandler, SummaryMouseClickHandler, MachineStateHandler } from './Annotation_event_handlers'


const Annotation = ({task_id, doc_json, summary_json, all_lemma_match_mtx, important_lemma_match_mtx, toggleSummaryHighlight, toggleDocHighlight}) => {
  // console.log(doc_json)
  // console.log(summary_json)
  // console.log(lemma_match_mtx)
  const [showAddTask, setShowAddTask] = useState(false)
  
  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);
  const [StateMachineState, SetStateMachineState] = useState("Start");


  const DocMouseClickHandlerWrapper = (tkn_id) => {
    DocMouseClickHandler({ tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked });
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    SummaryMouseClickHandler({ tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked });
  }

  const MachineStateHandlerWrapper = () => {
    MachineStateHandler({ StateMachineState, SetStateMachineState });
  }



  return (
      <>
        {/* <Header
          title={"Annotation"}
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask}
        /> */}
        <ResponsiveAppBar
           title={"Annotation"} StateMachineState = {StateMachineState} MachineStateHandler={MachineStateHandlerWrapper}
        />
        <div id="doc-text">
            <h3>Document</h3>
            <p>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json} DocMouseClickHandler={DocMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>

        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} SummaryMouseClickHandler={SummaryMouseClickHandlerWrapper} />
            ))};
            </p>
        </div>
        <footer>
          <Link to='/homepage'>back</Link>
        </footer>
      </>
  )
}

export default Annotation
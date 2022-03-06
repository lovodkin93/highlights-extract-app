import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocWord from './DocWord'
import SummaryWord from './SummaryWord'
import Header from './Header'
import ResponsiveAppBar from './ResponsiveAppBar'
import { DocMouseClickHandler, SummaryMouseClickHandler } from './Annotation_event_handlers'


const Annotation = ({task_id, doc_json, summary_json, lemma_match_mtx, toggleSummaryHighlight, toggleDocHighlight}) => {
  // console.log(doc_json)
  // console.log(summary_json)
  // console.log(lemma_match_mtx)
  const [showAddTask, setShowAddTask] = useState(false)
  const [DocMouseclickStartID, SetDocMouseDownStartID] = useState("-1");
  const [DocMouseclicked, SetDocMouseclicked] = useState(false);
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);


  const DocMouseClickHandlerWrapper = (tkn_id) => {
    DocMouseClickHandler({tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked});
  }

  const SummaryMouseClickHandlerWrapper = (tkn_id) => {
    SummaryMouseClickHandler({tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked});
  }

  // const DocMouseClickHandler = (tkn_id) => {
  //   const update_tkn = DocMouseclicked ? "-1" : tkn_id;
  //   if (DocMouseclicked){
  //     const min_ID =  (DocMouseclickStartID > tkn_id) ? tkn_id : DocMouseclickStartID;
  //     const max_ID =  (DocMouseclickStartID > tkn_id) ? DocMouseclickStartID : tkn_id;
  //     let chosen_IDs = [];
  //     for(let i=min_ID; i<=max_ID; i++){
  //       chosen_IDs.push(i);
  //     }
  //     toggleDocHighlight(chosen_IDs);     
  //   }
  //   SetDocMouseDownStartID(update_tkn);
  //   SetDocMouseclicked(!DocMouseclicked);
  // }

  // const SummaryMouseClickHandler = (tkn_id) => {
  //   const update_tkn = SummaryMouseclicked ? "-1" : tkn_id;
  //   if (SummaryMouseclicked){
  //     const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
  //     const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
  //     let chosen_IDs = [];
  //     for(let i=min_ID; i<=max_ID; i++){
  //       chosen_IDs.push(i);
  //     }
  //     toggleSummaryHighlight(chosen_IDs);     
  //   }
  //   SetSummaryMouseDownStartID(update_tkn);
  //   SetSummaryMouseclicked(!SummaryMouseclicked);
  // }

  return (
      <>
        {/* <Header
          title={"Annotation"}
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask}
        /> */}
        <ResponsiveAppBar
           title={"Annotation"}
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
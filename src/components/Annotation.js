import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocWord from './DocWord'
import SummaryWord from './SummaryWord'


const Annotation = ({task_id, doc_json, summary_json, lemma_match_mtx, toggleSummaryHighlight}) => {
  // console.log(doc_json)
  // console.log(summary_json)
  // console.log(lemma_match_mtx)
  const [SummaryMouseclickStartID, SetSummaryMouseDownStartID] = useState("-1");
  const [SummaryMouseclicked, SetSummaryMouseclicked] = useState(false);


  const SummaryMouseClickHandler = (tkn_id) => {
    const update_tkn = SummaryMouseclicked ? "-1" : tkn_id;
    if (SummaryMouseclicked){
      const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
      const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleSummaryHighlight(chosen_IDs)
      console.log(`first click is ${SummaryMouseclickStartID}. second click is ${tkn_id}. Chosen IDs are: ${chosen_IDs}`);
    }
    SetSummaryMouseDownStartID(update_tkn);
    SetSummaryMouseclicked(!SummaryMouseclicked);
  }

  return (
      <>
        <div id="doc-text">
            <h3>Document</h3>
            <p>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json}/>
            ))};
            </p>
        </div>

        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} toggleSummaryHighlight={toggleSummaryHighlight} SummaryMouseClickHandler={SummaryMouseClickHandler} />
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
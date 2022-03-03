import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocWord from './DocWord'
import SummaryWord from './SummaryWord'


const Annotation = ({task_id, doc_json, summary_json, lemma_match_mtx}) => {
  // console.log(doc_json)
  // console.log(summary_json)
  // console.log(lemma_match_mtx)


  return (
      <>
        <div id="doc-text">
            <h3>Document</h3>
            <p>
            {doc_json.map((word_json, index) => (
              <DocWord key={index} word_json={word_json} />
            ))};
            </p>
        </div>

        <div id="summary-text">
            <h3>Summary</h3>
            <p>
            {summary_json.map((word_json, index) => (
              <SummaryWord key={index} word_json={word_json} />
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
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import json_file from '../data/data_for_mturk.json'

const Annotation = ({task_id, doc_json, summary_json, lemma_match_mtx}) => {
  // const [doc_json, setDocJson] = useState();
  // const [summary_json, setSummaryJson] = useState();
  // const [lemma_match_mtx, setLemmaMtx] = useState();

  // useEffect(() => {
  //   setDocJson.apply(json_file["0"]["doc"]);
  //   setSummaryJson.apply(json_file["0"]["summary"]);
  //   setLemmaMtx.apply(json_file["0"]["lemma_match_mtx"]);
  // }, [])
  console.log(doc_json)
  console.log(summary_json)
  console.log(lemma_match_mtx)


  return (
      <>
        <div>  
          <h3>This is where the annotation will be {task_id}</h3>
          <Link to='/homepage'>back</Link>
        </div>
      </>
  )
}

export default Annotation
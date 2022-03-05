import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import StartPage from './components/StartPage'
import Instructions from './components/Instructions'
import GuidedAnnotation from './components/GuidedAnnotation'
import Annotation from './components/Annotation'
import { ConnectingAirportsOutlined } from '@mui/icons-material'
import json_file from './data/data_for_mturk.json'


const App = () => {

  // let task_id = "-1"; // default for showAddTask is false

  const [task_id, setTaskID] = useState("-1"); // default for task_id is -1
  const [doc_json, setDocJson] = useState([]);
  const [summary_json, setSummaryJson] = useState([]);
  const [lemma_match_mtx, setLemmaMtx] = useState([]);


  function addDocWordComponents(doc) {
    let updated_doc_json = [];
    doc.forEach((word) => {
      let underlined=false;
      let boldfaced=false;
      let highlighted=false;
      const newWord = {...word, underlined, boldfaced, highlighted}; 
      updated_doc_json = [...updated_doc_json, newWord];
    })
    setDocJson(updated_doc_json);
  }


  function addSummaryWordComponents(summary) {
    let updated_summary_json = [];
    summary.forEach((word) => {
      let underlined=false;
      let boldfaced=false;
      let highlighted=false;
      const newWord = {...word, underlined, boldfaced, highlighted}; 
      updated_summary_json = [...updated_summary_json, newWord];
    })
    setSummaryJson(updated_summary_json);
  }

  const toggleDocHighlight = (tkn_ids) => {
    // for (let i = 0; i < doc_json.length; i++) { if (tkn_ids.includes(doc_json[i].tkn_id)) {console.log(doc_json[i]);} }

    setDocJson(
      doc_json.map((word) =>
      tkn_ids.includes(word.tkn_id) ? { ...word, highlighted: !word.highlighted } : word
      )
    )
  }

  const toggleSummaryHighlight = (tkn_ids) => {
    // for (let i = 0; i < summary_json.length; i++) { if (tkn_ids.includes(summary_json[i].tkn_id)) {console.log(summary_json[i]);} }

    setSummaryJson(
      summary_json.map((word) =>
      tkn_ids.includes(word.tkn_id) ? { ...word, highlighted: !word.highlighted } : word
      )
    )
  }


    useEffect(() => {
      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const curr_id = urlParams.get('id');
        setTaskID(curr_id);

        addDocWordComponents(json_file[curr_id]["doc"])
        addSummaryWordComponents(json_file[curr_id]["summary"])
        setLemmaMtx(json_file[curr_id]["lemma_match_mtx"]);
        console.log(`id is ${curr_id}`);

        fetch(`/`).then(
          res => console.log(res)
        )
          
        }

      getTasks();
    }, [])
  

  return (
    <Router>
      <div className='container'>
        <Routes>
          <Route path='/' element={<StartPage />} />
          <Route path='/homepage' element={<StartPage />} />
          <Route path='/instructions' element={<Instructions />} />
          <Route path='/guidedAnnotation' element={<GuidedAnnotation />} />
          <Route path='/annotation' element={<Annotation 
                                              task_id={task_id} 
                                              doc_json = {doc_json}
                                              summary_json = {summary_json}
                                              lemma_match_mtx = {lemma_match_mtx}
                                              toggleSummaryHighlight = {toggleSummaryHighlight}
                                              toggleDocHighlight = {toggleDocHighlight} />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App

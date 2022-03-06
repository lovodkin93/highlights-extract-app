import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as React from 'react';

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
  const [all_lemma_match_mtx, setAllLemmaMtx] = useState([]);
  const [important_lemma_match_mtx, setImportantLemmaMtx] = useState([]);
  const [error_message, setErrorMessage] = React.useState("");

  /*************************************** error handling *************************************************/
  const Alert = React.forwardRef(function Alert(props, ref) {return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;});
  const handleErrorOpen = ({ msg }) => { 
    setErrorMessage(msg); 
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage("");
  };
/************************************************************************************************************* */

  function addDocWordComponents(doc) {
    let updated_doc_json = [];
    doc.forEach((word) => {
      let underlined=false;
      let boldfaced=false;
      let doc_highlighted=false; // all the doc's highlights so far
      let sent_highlighted=false; // all the sentence's highlights so far
      let span_highlighted=false; // all the span's highlights so far
      const newWord = {...word, underlined, boldfaced, span_highlighted, sent_highlighted, doc_highlighted}; 
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
      let chosen_span=false;
      let shadowed=false;
      const newWord = {...word, underlined, boldfaced, highlighted, shadowed, chosen_span}; 
      updated_summary_json = [...updated_summary_json, newWord];
    })
    setSummaryJson(updated_summary_json);
  }

  const toggleDocHighlight = (tkn_ids) => {
    setDocJson(doc_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, doc_highlighted: !word.doc_highlighted } : word))
  }

  const toggleSummaryHighlight = (tkn_ids) => {
    setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, highlighted: !word.highlighted } : word))
  }

  const SetSummaryShadow = (sent_id) => {
    setSummaryJson(summary_json.map((word) => word.sent_id === sent_id ? { ...word, shadowed: true } : { ...word, shadowed: false }))
  }

  const SetSummaryUnderline = (tkn_ids, CurrSentInd) => {
    // check if span chosen is from the correct sentence first.
    if ((summary_json.filter((word) => {return tkn_ids.includes(word.tkn_id) && word.sent_id !== CurrSentInd}).length) !== 0) { 
      handleErrorOpen({ msg : "Span chosen is not from the correct sentence." });
    } else{
      setSummaryJson(summary_json.map((word) => tkn_ids.includes(word.tkn_id) ? { ...word, underlined: !word.underlined } : word))
    }
  }
  


    useEffect(() => {
      const getTasks = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const curr_id = urlParams.get('id');
        setTaskID(curr_id);

        addDocWordComponents(json_file[curr_id]["doc"])
        addSummaryWordComponents(json_file[curr_id]["summary"])
        setAllLemmaMtx(json_file[curr_id]["all_lemma_match_mtx"]);
        setImportantLemmaMtx(json_file[curr_id]["important_lemma_match_mtx"]);
        // console.log(json_file);

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
                                              all_lemma_match_mtx = {all_lemma_match_mtx}
                                              important_lemma_match_mtx = {important_lemma_match_mtx}
                                              handleErrorOpen = {handleErrorOpen}
                                              toggleSummaryHighlight = {toggleSummaryHighlight}
                                              toggleDocHighlight = {toggleDocHighlight}
                                              SetSummaryShadow = {SetSummaryShadow}
                                              SetSummaryUnderline = {SetSummaryUnderline} />} />

        </Routes>
      </div>
      <Snackbar open={error_message !== ""} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error_message}
        </Alert>
      </Snackbar>
    </Router>
  )
}

export default App

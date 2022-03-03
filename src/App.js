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


  function updateID() {
    var urlSearchParams = new URLSearchParams(window.location.search);
    var params = Object.fromEntries(urlSearchParams.entries());
    task_id = params['id'];
    console.log(`updating...`);   
    console.log(`updating to ${task_id}`);
  }




  // useEffect(() => {
    
  //   const fetchTask = async (id) => {
  //     await setID()
  //     setTasks(tasksFromServer)
  //   }
  //   fetch(`/homepage/${task_id}`).then(
  //     res => res.json()
  //   ).then(
  //     data => console.log(data)
  //   )
  // }, []);


  // useEffect(() => {
  //   const getTasks = async () => {
  //     await setID()
  //     // await waitForIDToChange()
  //     if (task_id === "-1"){
  //       return
  //     } else{
  //       console.log(`updated to ${task_id}`)
  //       fetch(`/homepage?${task_id}`).then(
  //         res => res.json()
  //       ).then(
  //         data => console.log(data)
  //       )
  //       }
  //     }

  //   getTasks()
  // }, [])
    
    useEffect(() => {
    const getTasks = () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      const curr_id = urlParams.get('id');
      setTaskID(curr_id);
      console.log("AVIVSL: now doc:")
      console.log(json_file[curr_id]["doc"])
      setDocJson(json_file[curr_id]["doc"]);
      setSummaryJson(json_file[curr_id]["summary"]);
      setLemmaMtx(json_file[curr_id]["lemma_match_mtx"]);
      console.log(`id is ${curr_id}`);

      fetch(`/`).then(
        res => console.log(res)
      )
        
      }

    getTasks();
    }, [])
  
  console.log("now doc:")
  console.log(doc_json)
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
                                              lemma_match_mtx = {lemma_match_mtx} />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App

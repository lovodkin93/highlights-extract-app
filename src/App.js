import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import StartPage from './components/StartPage'
import Instructions from './components/Instructions'
import GuidedAnnotation from './components/GuidedAnnotation'
import Annotation from './components/Annotation'

const App = () => {

  useEffect(() => {
    fetch("/homepage").then(
      res => res.json()
    ).then(
      data => console.log(data)
    )
  }, []);

  return (
    <Router>
      <div className='container'>
        <Routes>
          <Route path='/' element={<StartPage />} />
          <Route path='/instructions' element={<Instructions />} />
          <Route path='/guidedAnnotation' element={<GuidedAnnotation />} />
          <Route path='/annotation' element={<Annotation />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App

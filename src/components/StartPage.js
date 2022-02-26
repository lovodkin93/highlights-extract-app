import { Link } from 'react-router-dom';
import * as React from 'react';



const StartPage = () => {
  return (
    <>
      <header className='GeneralPageHeader'>
          <h2>
            Highlighting Extraction UI
          </h2>
      </header>
      
      <div className='startPageBody'>

          <p className='StartPageText'>
            Welcome to the Highlighting Extraction UI.
            <br></br>
            Before starting annotating, please read the Instructions first and practice using the Guided Annotation option.
          </p>
      
          <Link 
              role="button"
              className='StartPageButton'
              id="instructionStartButton"
              to="/instructions"
          >
            Instructions
          </Link>

          <Link 
              role="button"
              className='StartPageButton'
              id="guidedAnnotationStartButton"
              to="/guidedAnnotation"
          >
            Guided Annotation
          </Link>

          <Link 
              role="button"
              className='StartPageButton'
              id="annotationStartButton"
              to="/annotation"
          >
            Annotation
          </Link>
      </div>
    </>
  )
}

export default StartPage
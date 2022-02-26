import { Link } from 'react-router-dom';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@material-ui/core/Button';



const StartPage = () => {
  return (
    <>
      <header className='GeneralPageHeader'>
          <h2>
            Highlighting Extraction UI
          </h2>
      </header>

      <section>
        <p className='StartPageText'>
          Welcome to the Highlighting Extraction UI.
          <br></br>
          Before starting annotating, please read the Instructions first and practice using the Guided Annotation option.
        </p>
      </section>
      
      <section>
        <Stack spacing={3} justifyContent="space-evenly" alignItems="center">

          <Button component={Link} to="/instructions" variant="contained" color="primary" size="large">
            Instructions
          </Button>
          
          <Button style={{maxWidth: '35%'}} component={Link} to="/guidedAnnotation" variant="contained" color="primary" size="large">
            Guided Annotation
          </Button>

          <Button style={{maxWidth: '35%'}} component={Link} to="/annotation" variant="contained" color="primary" size="large">
            Annotation
          </Button>
        </Stack>
      </section>
    </>
  )
}

export default StartPage
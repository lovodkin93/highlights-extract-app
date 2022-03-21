import { Link } from 'react-router-dom';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { spacing } from "@material-ui/system";



const pages = {'Instructions': 'instructions', 'Guided Annotation': 'guidedAnnotation'}; 



const StartPage = () => {
  return (
    <>
      {/* <header className='GeneralPageHeader'>
          <h2>Highlighting Extraction UI</h2>
      </header> */}

      <AppBar id="startPageAppBar" position="static">
      <div>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            Highlighting Extraction UI
          </Typography>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ my: 2, flexGrow: 1, display: {xs: 'flex', md: 'none' } }}
          >
            Highlighting Extraction UI
          </Typography>
          </Toolbar>
        </Container>
      </div>
    </AppBar>

    <div className="jumbotron text-center StartPageBody" /*className='StartPageBody'*/>
        <div className='StartPageText'>
          <p id="StartPageTitle">
            Welcome to
            <br></br>
            the Highlight Extraction UI
          </p>
          <p id="StartPageContent">Before starting annotating, please read the Instructions first and practice using the Guided Annotation option.</p>

          <div id="ButtonGroupBox">
            {/* <ButtonGroup> */}
              <Button className="StartPageButton" variant="contained" color="primary" component={Link} to={'/instructions'} >Instructions</Button>
              <Button className="StartPageButton" variant="contained" color="secondary" component={Link} to={'/guidedAnnotation'}>Guided<br></br>Annotation</Button>
              <Button className="StartPageButton" variant="contained" color="success" component={Link} to={'/annotation'}>Annotation</Button>
            {/* </ButtonGroup> */}
          </div>
        </div>
    </div>
    </>
  )
}

export default StartPage
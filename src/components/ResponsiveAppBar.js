import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'
import { ArrowForwardIosTwoTone } from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import { withStyles } from "@material-ui/core/styles";


const pages = {'Home Page': 'homepage', 'Instructions': 'instructions', 'Guided Annotation': 'guidedAnnotation', 'Annotation': 'annotation'}; // ['Products', 'Pricing', 'Blog']; // dict explanation: key=title, value=url_path //

const ResponsiveAppBar = ({ title, StateMachineState, MachineStateHandler, boldStateHandler }) => {
  const BlackTextTypography = withStyles({
    root: {
      color: "black",
      fontSize: "15pt",
      fontWeight: "14"
    }
  })(Typography);



  // const nextButtonText = () => {
  //   if(StateMachineState==="Start"){return "Start";}
  //   if(StateMachineState==="Choose Span"){return "Highlight"}
  //   if(StateMachineState==="Highlight"){return "Next Span"}
  // }

  const sliderTags = (value) =>{
    if (value===1) {
      return "None";
    } else if (value===2) {
      return "Span";
    } else {
      return "Sentence";
    }
  }

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            {title}
          </Typography>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(pages).filter(key => key !== title).map((ttl) => (
              <Button
                key={ttl}
                component={Link} to={`/${pages[ttl]}`}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {ttl}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ width: 190, alignItems: 'center' }}>
          <BlackTextTypography  id="bolding-options" color="secondary">
            BOLDING OPTIONS
          </BlackTextTypography>
            <Slider
              aria-label="Bolding-option"
              defaultValue={2}
              getAriaValueText={sliderTags}
              valueLabelFormat={sliderTags}
              valueLabelDisplay="auto"
              color="error"
              step={1}
              marks
              min={1}
              max={3}
              onChangeCommitted={boldStateHandler}
            />
          </Box>
          
          {/* <Button
            color="inherit"
            endIcon={<ArrowForwardIosTwoTone />}
            onClick={MachineStateHandler}
          >
            {nextButtonText()}
          </Button> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;

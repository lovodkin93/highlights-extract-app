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
import { padding } from '@mui/system';
import { styled } from '@mui/material/styles';
import { StyledSliderHighlighting, StyledSliderBolding } from './styled-sliders'

const pages = {'Home Page': 'homepage', 'Instructions': 'instructions', 'Guided Annotation': 'guidedAnnotation', 'Annotation': 'annotation'}; 

const ResponsiveAppBar = ({ title, StateMachineState, MachineStateHandlerWrapper, boldState, boldStateHandler, oldHighlightState, oldHighlightStateHandler }) => {
  const BlackTextTypography = withStyles({
    root: {
      color: "black",
      fontSize: "15pt",
      fontWeight: "14"
    }
  })(Typography);



  const BoldingSliderTags = (value) =>{
    if (value===1) {
      return "None";
    } else if (value===2) {
      return "Span";
    } else {
      return "Sentence";
    }
  }

  const BoldingSliderDefaultValue = () =>{
    if (boldState === "none") {
      return 1;
    } else if (boldState === "span") {
      return 2;
    } else {
      return 3;
    }
  }

  const OldHighlightingSliderTags = (value) =>{
    if (value===1) {
      return "None";
    } else if (value===2) {
      return "Sentence";
    } else {
      return "All";
    }
  }

  const OldHighlightingSliderDefaultValue = () =>{
    if (oldHighlightState === "none") {
      return 1;
    } else if (oldHighlightState === "sent") {
      return 2;
    } else {
      return 3;
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
            sx={{ flexGrow: 1, display: {xs: 'flex', md: 'none' } }}
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
          
          {["SUMMARY END", "SENTENCE END", "ANNOTATION"].includes(StateMachineState) && (
            <Box sx={{ margin:'0 30px' }}>
              <Button color="warning" variant="contained" onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER"})}>Revise</Button>
            </Box>
          )}

          {["REVISE HOVER", "REVISE CLICKED"].includes(StateMachineState) && (
            <Box sx={{ margin:'0 30px' }}>
              <Button color="success" variant="contained" onClick={() => MachineStateHandlerWrapper({forceState:"FINISH REVISION"})}>Finish Revision</Button>
            </Box>
          )}



          <Box sx={{ width: 190, alignItems: 'center', padding: '0 40px 0 0' }}>
            <BlackTextTypography  id="old-highlighting-slider-title" color="secondary">
                OLD ALIGNMENTS
            </BlackTextTypography>
            <StyledSliderHighlighting 
              aria-label="Old-Highlighting-option"
              defaultValue={3}
              getAriaValueText={OldHighlightingSliderTags}
              valueLabelFormat={OldHighlightingSliderTags}
              valueLabelDisplay="auto"
              value={OldHighlightingSliderDefaultValue()}
              color="info"
              step={1}
              marks
              min={1}
              max={3}
              onChangeCommitted={(event, newValue) => oldHighlightStateHandler({event:event, newValue:newValue, sent_ind:-1})}
            />
          </Box>

          <Box sx={{ width: 190, alignItems: 'center' }}>
            <BlackTextTypography  id="bolding-slider-title" color="secondary">
              BOLDING
            </BlackTextTypography>
            <StyledSliderBolding
              aria-label="Bolding-option"
              defaultValue={3}
              getAriaValueText={BoldingSliderTags}
              valueLabelFormat={BoldingSliderTags}
              valueLabelDisplay="auto"
              value={BoldingSliderDefaultValue()}
              color="error"
              step={1}
              marks
              min={1}
              max={3}
              onChangeCommitted={boldStateHandler}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;

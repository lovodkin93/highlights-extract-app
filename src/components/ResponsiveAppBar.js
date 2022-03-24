import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'
import { ArrowForwardIosTwoTone } from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import { withStyles } from "@material-ui/core/styles";
import { padding } from '@mui/system';
import { styled } from '@mui/material/styles';
import { StyledSliderHighlighting, StyledSliderBolding } from './styled-sliders'


import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const pages = {'Instructions': 'instructions', 'Guided Annotation': 'guidedAnnotation', 'Annotation': ''}; 

const ResponsiveAppBar = ({ title, StateMachineState, MachineStateHandlerWrapper, boldState, boldStateHandler, oldAlignmentState, oldAlignmentStateHandler }) => {
  const BlackTextTypography = withStyles({
    root: {
      color: "white",
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
    if (oldAlignmentState === "none") {
      return 1;
    } else if (oldAlignmentState === "sent") {
      return 2;
    } else {
      return 3;
    }
  }

  return (

    <Navbar bg="secondary" variant="dark" className="w-100 p-2">
      <Container>
      <Navbar.Brand>{title}</Navbar.Brand>
      <Nav className="me-auto">
        {Object.keys(pages).filter(key => key !== title).map((ttl) => (
                <Nav.Item as="li">
                  <Nav.Link
                    key={ttl}
                    as={Link} to={`/${pages[ttl]}`}
                  >
                    {ttl}
                    </Nav.Link>
                </Nav.Item>
        ))}
    </Nav>    

          { title !== "Instructions" && (
                <Col md={2} padding={2} className="slider-padding">
                  <BlackTextTypography  id="old-highlighting-slider-title">
                      OLD ALIGNMENTS
                  </BlackTextTypography>
                  <StyledSliderHighlighting 
                    aria-label="Old-Highlighting-option"
                    defaultValue={3}
                    getAriaValueText={OldHighlightingSliderTags}
                    valueLabelFormat={OldHighlightingSliderTags}
                    valueLabelDisplay="auto"
                    value={OldHighlightingSliderDefaultValue()}
                    sx={{ color: 'warning.main' }}
                    step={1}
                    marks
                    min={1}
                    max={3}
                    onChangeCommitted={(event, newValue) => oldAlignmentStateHandler({event:event, newValue:newValue, sent_ind:-1})}
                  />
                </Col>
          )}


          { title !== "Instructions" && (
              <Col md={ 2 } className="slider-padding">
                <BlackTextTypography  id="bolding-slider-title">
                  BOLDING
                </BlackTextTypography>
                <StyledSliderBolding
                  aria-label="Bolding-option"
                  defaultValue={3}
                  getAriaValueText={BoldingSliderTags}
                  valueLabelFormat={BoldingSliderTags}
                  valueLabelDisplay="auto"
                  value={BoldingSliderDefaultValue()}
                  color="secondary"
                  step={1}
                  marks
                  min={1}
                  max={3}
                  onChangeCommitted={boldStateHandler}
                />
              </Col>
            )}
      </Container>
    </Navbar>














    // <AppBar position="static" color="primary" width="100%">
    //   <Container maxWidth="xl">
    //     <Toolbar disableGutters>
    //       <Typography
    //         variant="h6"
    //         noWrap
    //         component="div"
    //         sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
    //       >
    //         {title}
    //       </Typography>

    //       <Typography
    //         variant="h6"
    //         noWrap
    //         component="div"
    //         sx={{ flexGrow: 1, display: {xs: 'flex', md: 'none' } }}
    //       >
    //         {title}
    //       </Typography>
    //       <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
    //         {Object.keys(pages).filter(key => key !== title).map((ttl) => (
    //           <Button
    //             key={ttl}
    //             component={Link} to={`/${pages[ttl]}`}
    //             sx={{ my: 2, color: 'white', display: 'block' }}
    //           >
    //             {ttl}
    //           </Button>
    //         ))}
    //       </Box>
          
    //       {["SUMMARY END", "SENTENCE END", "ANNOTATION", "SENTENCE START"].includes(StateMachineState) && (
    //         <Box sx={{ margin:'0 30px' }}>
    //           <Button color="warning" variant="contained" onClick={() => MachineStateHandlerWrapper({forceState:"REVISE HOVER"})}>Revise</Button>
    //         </Box>
    //       )}

    //       {StateMachineState === "REVISE HOVER" && (
    //         <Box sx={{ margin:'0 30px' }}>
    //           <Button color="success" variant="contained" onClick={() => MachineStateHandlerWrapper({forceState:"FINISH REVISION"})}>Finish Revision</Button>
    //         </Box>
    //       )}



    //       { title !== "Instructions" && (
    //         <Box sx={{ width: 190, alignItems: 'center', padding: '0 40px 0 0' }}>
    //           <BlackTextTypography  id="old-highlighting-slider-title" color="secondary">
    //               OLD ALIGNMENTS
    //           </BlackTextTypography>
    //           <StyledSliderHighlighting 
    //             aria-label="Old-Highlighting-option"
    //             defaultValue={3}
    //             getAriaValueText={OldHighlightingSliderTags}
    //             valueLabelFormat={OldHighlightingSliderTags}
    //             valueLabelDisplay="auto"
    //             value={OldHighlightingSliderDefaultValue()}
    //             color="info"
    //             step={1}
    //             marks
    //             min={1}
    //             max={3}
    //             onChangeCommitted={(event, newValue) => oldAlignmentStateHandler({event:event, newValue:newValue, sent_ind:-1})}
    //           />
    //         </Box>
    //       )}

    //       { title !== "Instructions" && (
    //         <Box sx={{ width: 190, alignItems: 'center' }}>
    //           <BlackTextTypography  id="bolding-slider-title" color="secondary">
    //             BOLDING
    //           </BlackTextTypography>
    //           <StyledSliderBolding
    //             aria-label="Bolding-option"
    //             defaultValue={3}
    //             getAriaValueText={BoldingSliderTags}
    //             valueLabelFormat={BoldingSliderTags}
    //             valueLabelDisplay="auto"
    //             value={BoldingSliderDefaultValue()}
    //             color="error"
    //             step={1}
    //             marks
    //             min={1}
    //             max={3}
    //             onChangeCommitted={boldStateHandler}
    //           />
    //         </Box>
    //       )}
    //     </Toolbar>
    //   </Container>
    // </AppBar>
  );
};
export default ResponsiveAppBar;

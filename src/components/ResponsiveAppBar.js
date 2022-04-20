import * as React from 'react';
import { useRef } from 'react'
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
import Overlay from 'react-bootstrap/Overlay'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const pages = {"Tutorial": "tutorial", 'Guided Annotation': 'guidedAnnotation',  'Annotation': ''}; 


const ResponsiveAppBar = ({ title, StateMachineState, MachineStateHandlerWrapper, boldState, boldStateHandler, oldAlignmentState, oldAlignmentStateHandler, t_StateMachineStateId, g_showWhereNavbar }) => {
  const whereNavBar = useRef(null);
  const whereNavBarArr = {"Tutorial": undefined, 'Guided Annotation': whereNavBar,  'Annotation': undefined}; 
  
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

  const margin_left = (curr_ttl) =>{
    if (title==="Guided Annotation" && curr_ttl=="Tutorial") {
      return "6%"
    } else if (title==="Annotation" && curr_ttl==="Tutorial") {
      return "-2%"
    } else if (title==="Tutorial" && curr_ttl==="Tutorial") {
      return "-6%"
    } 
    
    else if (title==="Guided Annotation" && curr_ttl=="Guided Annotation") {
      return "-2%"
    } else if (title==="Annotation" && curr_ttl==="Guided Annotation") {
      return "-5%"
    } else if (title==="Tutorial" && curr_ttl==="Guided Annotation") {
      return "-6%"
    }     
    
    else if (title==="Guided Annotation" && curr_ttl=="Annotation") {
      return "-4%"
    } else if (title==="Annotation" && curr_ttl==="Annotation") {
      return "-6%"
    } else if (title==="Tutorial" && curr_ttl==="Annotation") {
      return "-8%"
    } 
  }


  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Simple tooltip
    </Tooltip>
  );

  return (

    <>
      <Navbar bg="secondary" variant="dark" className="w-100 p-2">
        <Container className='navbar-container'>
          {/* <Row  className="navbar-row"> */}
            <Col md={{span:1, offset:0}}>
                      <Navbar.Brand>{title}</Navbar.Brand>
            </Col>
            {/* <Col md={{span:12, offset:0}}>
              <Nav className="me-auto"> */}
                  {Object.keys(pages).map((ttl, index) => {
                      return (<Col style={{marginLeft:`${margin_left(ttl)}`}} md={(ttl==="Guided Annotation")? {span:2, offset:0}:{span:1, offset:0}}>
                        <Nav className="me-auto" ref={whereNavBarArr[ttl]}>
                          <Nav.Item as="li">
                            <Nav.Link
                              key={ttl}
                              as={Link} to={`/${pages[ttl]}`}
                            >
                              {ttl}
                              </Nav.Link>
                          </Nav.Item>
                          </Nav>
                      </Col>)
                  }
                  )}
              {/* </Nav>
            </Col> */}
          {/* </Row> */}

            { title !== "Instructions" && (
                  <Col md={{span:2, offset:2}}>
                    <BlackTextTypography  id="old-highlighting-slider-title">
                        OLD ALIGNMENTS
                    </BlackTextTypography>
                    <StyledSliderHighlighting
                      className={`${(t_StateMachineStateId === 10) ? 'with-glow':''}`} 
                      aria-label="Old-Highlighting-option"
                      defaultValue={3}
                      getAriaValueText={OldHighlightingSliderTags}
                      valueLabelFormat={OldHighlightingSliderTags}
                      valueLabelDisplay="auto"
                      value={OldHighlightingSliderDefaultValue()}
                      sx={{ color: 'primary.dark' }}
                      step={1}
                      marks
                      min={1}
                      max={3}
                      onChangeCommitted={(event, newValue) => oldAlignmentStateHandler({event:event, newValue:newValue, sent_ind:-1})}
                    />
                  </Col>
            )}


            { title !== "Instructions" && (
                <Col style={{marginLeft:"3%"}} md={{span:2, offset:0}}>
                  <BlackTextTypography  id="bolding-slider-title">
                    BOLDING
                  </BlackTextTypography>
                  <StyledSliderBolding
                    className={`${(t_StateMachineStateId === 8) ? 'with-glow':''}`}
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
                </Col>
              )}
        </Container>
      </Navbar>




      <Overlay target={whereNavBar.current} show={g_showWhereNavbar} placement="bottom">
        {(props) => (
          <Tooltip {...props} id="overlay-where-navbar">
              I'm right here!
          </Tooltip>
        )}
      </Overlay>
    </>















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

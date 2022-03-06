import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom'
import { ArrowForwardIosTwoTone } from '@mui/icons-material';

const pages = {'Home Page': 'homepage', 'Instructions': 'instructions', 'Guided Annotation': 'guidedAnnotation', 'Annotation': 'annotation'}; // ['Products', 'Pricing', 'Blog']; // dict explanation: key=title, value=url_path //

const ResponsiveAppBar = ({ title, StateMachineState, MachineStateHandler }) => {

  const nextButtonText = () => {
    if(StateMachineState==="Start"){return "Start"}
  }


  return (
    <AppBar position="static">
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

          <Button
            color="inherit"
            endIcon={<ArrowForwardIosTwoTone />}
            onClick={MachineStateHandler}
          >
            {nextButtonText()}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;

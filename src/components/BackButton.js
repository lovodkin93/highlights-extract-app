import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ResponsiveAppBar from './ResponsiveAppBar'

const BackButton = ({ back_path }) => {
    return (
        <Button component={Link} to={back_path} startIcon={<ArrowBackIosNewIcon />}>
              back
        </Button>

    )
  }
  
  export default BackButton
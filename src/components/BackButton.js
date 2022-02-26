import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const BackButton = ({ back_path }) => {
    return (
        <Button style={{maxWidth: '35%'}} component={Link} to={back_path} color="info" size="small" startIcon={<ArrowBackIosNewIcon />}>
              back
        </Button>

    )
  }
  
  export default BackButton
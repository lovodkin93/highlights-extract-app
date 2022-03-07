
// import Button from '@mui/material/Button';
// import { ArrowForwardIosTwoTone } from '@mui/icons-material';


// const NextStateButton = ({ StateMachineState, MachineStateHandler }) => {
//     const nextButtonText = () => {
//         if(StateMachineState==="Start"){return "Start";}
//         if(StateMachineState==="Choose Span"){return "Highlight"}
//         if(StateMachineState==="Highlight"){return "Next Span"}
//       }

//       return (
//         <Button
//         color="inherit"
//         endIcon={<ArrowForwardIosTwoTone />}
//         onClick={MachineStateHandler}
//       >
//         {nextButtonText()}
//       </Button>
//       );


// };

// export default NextStateButton;



import Button from '@mui/material/Button';
import { ArrowForwardIosTwoTone } from '@mui/icons-material';


const NextStateButton = ({StateMachineState, MachineStateHandler}) => {
    const nextButtonText = () => {
        if(StateMachineState==="Start"){return "Start";}
        if(StateMachineState==="Choose Span"){return "Highlight"}
        if(StateMachineState==="Highlight"){return "Next Span"}
      }

  return (
      <>
        <Button
          color="inherit"
          endIcon={<ArrowForwardIosTwoTone />}
          onClick={MachineStateHandler}
        >
          {nextButtonText()}
        </Button>
      </>
  )
}

export default NextStateButton
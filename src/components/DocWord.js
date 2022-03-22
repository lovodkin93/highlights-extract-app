import Typography from '@mui/material/Typography';

const DocWord = ({ word_json, StateMachineState, DocMouseClickHandlerWrapper, hoverHandlerWrapper, DocOnMouseDownHandler, DocOnMouseUpHandler, setDocOnMouseDownActivated, docOnMouseDownActivated, setHoverActivatedId, ctrlButtonDown, setHoverActivatedDocOrSummary }) => {
    // const XOR = (a,b) => {
    //   return ( ( a && !b ) || ( !a && b ) )
    // }

    // const is_span_highlighted = () => {
    //   if (ctrlButtonDown) {
    //     return word_json.span_highlighted && !word_json.span_alignment_hover
    //   } 
    //   else {
    //     return word_json.span_highlighted
    //   }
    // }
  
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`docWord noselect 
                    ${(word_json.span_highlighted && !word_json.span_alignment_hover) ?  'span-highlighted-word': ''} 
                    ${(word_json.span_alignment_hover && !ctrlButtonDown) ?  'span-aligned-hover-word': ''} 
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${word_json.boldfaced ? 'boldfaced-word': 'normal-sized-word'}
                    ${(word_json.old_alignment_hover && StateMachineState==="REVISE HOVER") ? 'old-aligned-hover-word': ''}
                    ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}
                    ${(word_json.red_color) ? 'red-color-word': ''}`}
        
        style={{fontFamily: "IBM Plex Sans", lineHeight: 1.8}}
        onClick={() => DocMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => {setHoverActivatedId(word_json.tkn_id); setHoverActivatedDocOrSummary("doc"); hoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0], isSummary:false})}}
        onMouseLeave={() => hoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0], tkn_id:word_json.tkn_id, isSummary:false})}
        onMouseDown={() => DocOnMouseDownHandler(word_json.tkn_id)}
        onMouseUp={() => DocOnMouseUpHandler()}
      >
        <nobr>
          {word_json.word}
        </nobr>&nbsp;
      </div>
    )
  }
  
  export default DocWord
import Typography from '@mui/material/Typography';

const DocWord = ({ word_json, DocOnMouseDownID, doc_paragraph_breaks, StateMachineState, DocMouseClickHandlerWrapper, hoverHandlerWrapper, DocOnMouseDownHandler, DocOnMouseUpHandler, setDocOnMouseDownActivated, docOnMouseDownActivated, setHoverActivatedId, ctrlButtonDown, setHoverActivatedDocOrSummary }) => {
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

    const show_word = () => {
      if (word_json.word !== "\n"){
        return word_json.word
      } else {
        return ""
      }
    }
  
    // the "&nbsp;" is to add space after word
    return (
      <div>
        {/* {(word_json.word !== "\n") && (
          <div
            className={`docWord noselect
                        ${(word_json.span_highlighted && !word_json.span_alignment_hover) ?  'span-highlighted-word': ''} 
                        ${(word_json.span_alignment_hover && !ctrlButtonDown) ?  'span-aligned-hover-word': ''} 
                        ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                        ${word_json.boldfaced ? 'boldfaced-word': 'normal-sized-word'}
                        ${(word_json.old_alignment_hover && StateMachineState==="REVISE HOVER") ? 'old-aligned-hover-word': ''}
                        ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                        ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}
                        ${(word_json.red_color) ? 'red-color-word': 'text-muted'}
                        `}
            
            style={{fontFamily: "IBM Plex Sans", lineHeight: "0"}}
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
        )}

        {(word_json.word === "\n") && (
          <span className="br-class"></span>
        )} */}

          <div
            className={`docWord noselect
                        ${(word_json.span_highlighted && !word_json.span_alignment_hover  && !(word_json.red_color && !docOnMouseDownActivated)) ?  'span-highlighted-word': ''} 
                        ${(word_json.span_alignment_hover && !ctrlButtonDown) ?  'span-aligned-hover-word': ''} 
                        ${(word_json.old_alignments && !word_json.span_highlighted && !(word_json.red_color && !docOnMouseDownActivated)) ? 'old-aligned-word': ''}
                        ${(word_json.red_color && !docOnMouseDownActivated) ? 'red-color-word': ''}
                        ${(word_json.boldfaced) ? 'boldfaced-word': ''}
                        ${(!word_json.boldfaced) ? 'text-muted': ''}
                        ${(word_json.old_alignment_hover && StateMachineState==="REVISE HOVER") ? 'old-aligned-hover-word': ''}
                        ${(StateMachineState !== "REVISE HOVER" && DocOnMouseDownID==="-1") ? 'cursor-grab' : ''}
                        ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}
                        `}
            
            style={{fontFamily: "IBM Plex Sans", lineHeight: "1"}}
            onClick={() => DocMouseClickHandlerWrapper(word_json.tkn_id)}
            onMouseEnter={() => {setHoverActivatedId(word_json.tkn_id); setHoverActivatedDocOrSummary("doc"); hoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0], isSummary:false})}}
            onMouseLeave={() => {hoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0], tkn_id:word_json.tkn_id, isSummary:false})}}
            onMouseDown={() => DocOnMouseDownHandler(word_json.tkn_id)}
            // onMouseUp={() => DocOnMouseUpHandler()}
          >
              <nobr>
                {show_word()}
              </nobr>&nbsp;
          </div>

          {(doc_paragraph_breaks.includes(word_json.tkn_id)) && (
          <span className="br-class"></span>
        )}

      </div>
    )
  }
  
  export default DocWord
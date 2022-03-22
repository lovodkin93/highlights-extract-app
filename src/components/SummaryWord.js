const SummaryWord = ({ word_json, StateMachineState, SummaryMouseClickHandlerWrapper, hoverHandlerWrapper, SummaryOnMouseDownHandler, SummaryOnMouseUpHandler, setSummaryOnMouseDownActivated, summaryOnMouseDownActivated, setHoverActivatedId, ctrlButtonDown, setHoverActivatedDocOrSummary }) => {
  
    // const XOR = (a,b) => {
    //   return ( ( a && !b ) || ( !a && b ) )
    // }

    // const is_span_highlighted = () => {
    //   if (ctrlButtonDown) {
    //     return word_json.span_highlighted && !word_json.span_alignment_hover
    //   } 
    //   else {
    //     return word_json.span_highlighted || word_json.span_alignment_hover
    //   }
    // }
  
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`summaryWord noselect normal-sized-word
                    ${word_json.shadowed ? 'shadowed-word': ''}
                    ${(word_json.span_highlighted && !word_json.span_alignment_hover) ? 'span-highlighted-word': ''} // if the word was span_highlighted before and now go over it again, then should unspan it
                    ${(word_json.span_alignment_hover && !ctrlButtonDown) ?  'span-aligned-hover-word': ''} 
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${(word_json.old_alignment_hover && StateMachineState==="REVISE HOVER") ? 'old-aligned-hover-word': ''} 
                    ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}`}
        style={{fontFamily: "IBM Plex Sans", lineHeight: 1.8}}
        onClick={() => SummaryMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => {setHoverActivatedId(word_json.tkn_id); setHoverActivatedDocOrSummary("summary"); hoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0], tkn_id:word_json.tkn_id, isSummary:true})}}
        onMouseLeave={() => hoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0], tkn_id:word_json.tkn_id, isSummary:true})}
        onMouseDown={() => SummaryOnMouseDownHandler(word_json.tkn_id)} 
        onMouseUp={() => SummaryOnMouseUpHandler()} 
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </div>
    )
  }
  
  export default SummaryWord
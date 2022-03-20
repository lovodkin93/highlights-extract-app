const SummaryWord = ({ word_json, StateMachineState, SummaryMouseClickHandlerWrapper, reviseHoverHandlerWrapper, SummaryOnMouseDownHandler, SummaryOnMouseUpHandler, setSummaryOnMouseDownActivated, summaryOnMouseDownActivated, setHoverActivatedId }) => {
  
    const XOR = (a,b) => {
      return ( ( a && !b ) || ( !a && b ) )
    }
  
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`summaryWord noselect
                    ${word_json.shadowed ? 'shadowed-word': ''}
                    ${(XOR(word_json.span_highlighted, word_json.span_alignment_hover)) ? 'span-highlighted-word': ''} // if the word was span_highlighted before and now go over it again, then should unspan it
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${(word_json.old_alignment_hover && StateMachineState==="REVISE HOVER") ? 'old-aligned-hover-word': ''} 
                    ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}`}
        onClick={() => SummaryMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => {setHoverActivatedId(word_json.tkn_id); reviseHoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0]})}} //AVIVSL: TODO: add summary alignment helper here
        
        onMouseLeave={() => reviseHoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0]})}
        onMouseDown={() => SummaryOnMouseDownHandler(word_json.tkn_id)} 
        onMouseUp={() => SummaryOnMouseUpHandler()} 
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </div>
    )
  }
  
  export default SummaryWord
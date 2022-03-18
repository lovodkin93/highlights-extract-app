const SummaryWord = ({ word_json, StateMachineState, SummaryMouseClickHandlerWrapper, reviseHoverHandlerWrapper, SummaryOnMouseDownHandler, SummaryOnMouseUpHandler }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`summaryWord noselect
                    ${word_json.shadowed ? 'shadowed-word': ''}
                    ${word_json.span_highlighted ? 'span-highlighted-word': ''} //AVIVSL: TODO: add summary alignment helper here (need to add the XOR function)
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${word_json.old_alignment_hover ? 'old-aligned-hover-word': ''} //AVIVSL: TODO: add summary alignment helper here
                    ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}`}
        onClick={() => SummaryMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => reviseHoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0]})} //AVIVSL: TODO: add summary alignment helper here
        onMouseLeave={() => reviseHoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0]})}
        onMouseDown={() => SummaryOnMouseDownHandler(word_json.tkn_id)} //AVIVSL: TODO: add summary alignment helper here
        onMouseUp={() => SummaryOnMouseUpHandler(word_json.tkn_id)} //AVIVSL: TODO: add summary alignment helper here
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </div>
    )
  }
  
  export default SummaryWord
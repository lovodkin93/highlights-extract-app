const DocWord = ({ word_json, StateMachineState, DocMouseClickHandlerWrapper, reviseHoverHandlerWrapper, DocOnMouseDownHandler, DocOnMouseUpHandler }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`docWord noselect 
                    ${word_json.span_highlighted ? 'span-highlighted-word': ''}
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${word_json.boldfaced ? 'boldfaced-word': ''}
                    ${word_json.old_alignment_hover ? 'old-aligned-hover-word': ''}
                    ${(StateMachineState !== "REVISE HOVER") ? 'cursor-span' : ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}`}
        onClick={() => DocMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => reviseHoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0]})}
        onMouseLeave={() => reviseHoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0]})}
        onMouseDown={() => DocOnMouseDownHandler(word_json.tkn_id)}
        onMouseUp={() => DocOnMouseUpHandler(word_json.tkn_id)}
      >
        <nobr>
          {word_json.word}
        </nobr>&nbsp;
      </div>
    )
  }
  
  export default DocWord
const DocWord = ({ word_json, StateMachineState, DocMouseClickHandlerWrapper, reviseHoverHandlerWrapper }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`docWord 
                    ${word_json.span_highlighted ? 'span-highlighted-word': ''}
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'old-aligned-word': ''}
                    ${word_json.boldfaced ? 'boldfaced-word': ''}
                    ${word_json.old_alignment_hover ? 'old-aligned-hover-word': ''}
                    ${(word_json.old_alignments && StateMachineState==="REVISE HOVER") ? 'cursor-pointer': ''}`}
        onClick={() => DocMouseClickHandlerWrapper(word_json.tkn_id)}
        onMouseEnter={() => reviseHoverHandlerWrapper({inOrOut:"in", curr_alignment_id:word_json.alignment_id[0]})}
        onMouseLeave={() => reviseHoverHandlerWrapper({inOrOut:"out", curr_alignment_id:word_json.alignment_id[0]})}
      >
        <nobr>
          {word_json.word}
        </nobr>&nbsp;
      </div>
    )
  }
  
  export default DocWord
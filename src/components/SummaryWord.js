const SummaryWord = ({ word_json, SummaryMouseClickHandlerWrapper }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`summaryWord 
                    ${word_json.shadowed ? 'shadowed-word': ''}
                    ${word_json.underlined ? 'underlined-word': ''}
                    ${word_json.span_highlighted ? 'span-highlighted-word': ''}
                    ${(word_json.old_alignments && !word_json.span_highlighted) ? 'all-highlighted-word': ''}`}
        onClick={() => SummaryMouseClickHandlerWrapper(word_json.tkn_id)}
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </div>
    )
  }
  
  export default SummaryWord
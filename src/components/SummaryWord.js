const SummaryWord = ({ word_json, SummaryMouseClickHandler }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`summaryWord 
                    ${word_json.highlighted ? 'highlighted-word': ''}
                    ${word_json.shadowed ? 'shadowed-word': ''}
                    ${word_json.underlined ? 'underlined-word': ''}`}
        onClick={() => SummaryMouseClickHandler(word_json.tkn_id)}
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </div>
    )
  }
  
  export default SummaryWord
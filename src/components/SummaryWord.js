const SummaryWord = ({ word_json, SummaryMouseClickHandler }) => {
    // the "&nbsp;" is to add space after word
    return (
      <word
        className={`summaryWord ${word_json.highlighted ? 'highlighted-word': ''}`}
        onClick={() => SummaryMouseClickHandler(word_json.tkn_id)}
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </word>
    )
  }
  
  export default SummaryWord
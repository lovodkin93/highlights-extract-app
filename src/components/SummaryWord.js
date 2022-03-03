const SummaryWord = ({ word_json }) => {
    // the "&nbsp;" is to add space after word
    return (
      <word
        className={`summaryWord`}
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </word>
    )
  }
  
  export default SummaryWord
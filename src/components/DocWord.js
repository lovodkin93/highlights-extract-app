const DocWord = ({ word_json }) => {
    // the "&nbsp;" is to add space after word
    return (
      <word
        className={`docWord`}
      >
        <nobr>{word_json.word}</nobr>&nbsp;
      </word>
    )
  }
  
  export default DocWord
const DocWord = ({ word_json }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`docWord ${word_json.boldfaced ? 'boldfaced-word': ''}`}
      >
        <nobr>
          {word_json.word}
        </nobr>&nbsp;
      </div>
    )
  }
  
  export default DocWord
const DocWord = ({ word_json, DocMouseClickHandler }) => {
    // the "&nbsp;" is to add space after word
    return (
      <div
        className={`docWord ${word_json.doc_highlighted ? 'highlighted-word': ''}`}
        onClick={() => DocMouseClickHandler(word_json.tkn_id)}
      >
        <nobr>
          {word_json.word}
        </nobr>&nbsp;
      </div>
    )
  }
  
  export default DocWord
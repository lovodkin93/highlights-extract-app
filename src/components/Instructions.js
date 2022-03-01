import BackButton from './BackButton'

const Instructions = () => {
  return (
    <>
      <header className='GeneralPageHeader'>
        <h2>Instructions</h2>
      </header>
      <div>
        <section  className="InstructionsBody">
          <h4>
            In this task, you are presented with a document and its summary and your goal is to find all the relevant spans from the document that contibuted to the summary.
            <br></br>
            You will first be presented with the summary and document without any extra markings.
            <br></br>
            We encourage you to read the summary in full and skim through the document so you are familiar with the topics discussed in them.
            <br></br>
            After that you will work sentence by sentence, where you will not be able to continue to the next sentence before "highlighting" all of the current sentence's words.
            <br></br>
            When starting to work on a sentence, all the words in the doc who have identical or relating words in that sentence will be <text className="boldWords">boldfaced</text>. This should help you understand the regions in the document with potential aligning information.
            <br></br>
            Once you start working on the sentence, the blodfaced words in the document will return to normal.
            <br></br>
            After that, you will work in iterations:
            <ol>
              <li>
                Start by choosing a subspan of the summary sentence which contains at least one event (by highlighting it).
                <br></br>
                This will boldface all the words in the document identical or similar to those in the span.
              </li>

              <li>Then, highlight spans in the document aligning to the information in the span, while simultaneously highlighting the relevant part of the summary span to make sure you missed nothing.</li>
              <li>Before heading on to the next span, please make sure you covered all the span's information and only it. If needed, make adjustments to the highlighting.</li>
            </ol>
            You would be able to continue to the next sentence only after covering all the summary sentence.
            You may follow these questions to help you decide what span to choose:
            <ul>
              <li>Is the information presented in the span missing something? Or is it self-informative?</li>
              <li>Is the information presented in the span specific? Or is it too general?</li>
            </ul>
            For long sentences, we strongly advice against highlighting the full sentence all at once, as doing so could lead to missing small details.
            <br></br>
            Alternatively, if a sentence is short enough, aligning it all at once is acceptable.
            <br></br>
            When choosing a span, a general rule of thumb should be a span that when reading it, you manage to remember all the details in it.
            <br></br>
            For example, the sentence:
          </h4>
          
          <h3>
            Sixty Forest Service firefighters brought Michigan's four-day Hiawatha
            <br></br> 
            National Forest fire under control after it burned 1100 acres of woodlands.
          </h3>

          <h4>
            can be seperated into the following span groups:
            <ul>
              <li>Sixty Forest Service firefighters brought Michigan's four-day Hiawatha National Forest fire under control \ fire under control after it burned 1100 acres of woodlands.</li>
              <li>Sixty Forest Service firefighters brought ... fire under control \ Michigan's four-day Hiawatha National Forest fire \ fire under control after it burned 1100 acres of woodlands.</li>
            </ul>
            and shouldn't be handled all at once.
            <br></br>
            <b> Notice! Make sure that what you highlight in the document covers all the information in the summary and only it.</b>
          </h4>
        </section>
        
        
        <footer>
        <BackButton back_path={"/"} />
        </footer>
      </div>
    </>
  )
}

export default Instructions

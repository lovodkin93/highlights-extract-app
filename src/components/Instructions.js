import BackButton from './BackButton'
import ResponsiveAppBar from './ResponsiveAppBar'
import start_window_img from '../data/Instructions_img/start.JPG'; // Tell webpack this JS file uses this image
import some_span_chosen_img from '../data/Instructions_img/some_span_chosen.JPG'; // Tell webpack this JS file uses this image
import appbar_img from '../data/Instructions_img/appbar.JPG'; // Tell webpack this JS file uses this image
import revise_hover_img from '../data/Instructions_img/revise_hover.png'; // Tell webpack this JS file uses this image
import revise_clicked_img from '../data/Instructions_img/revise_clicked.JPG'; // Tell webpack this JS file uses this image
import appbar_finish_revision_img from '../data/Instructions_img/appbar_finish_revision.JPG'; // Tell webpack this JS file uses this image
import submit_img from '../data/Instructions_img/submit.JPG'; // Tell webpack this JS file uses this image


const Instructions = () => {
  return (
    <>
        <ResponsiveAppBar
           title={"Instructions"}
        />
      <div>
        <section  className="InstructionsBody">
          <h4>
            In this task, you are presented with a document and its summary. 
            <br></br>
            The summary was constructed by an expert summarizer who first highlighted important information in the document and then merged it in a coherent manner. 
            <br></br>
            Your goal is to locate those spans the summarizer highlighted.
            <br></br>
            You will first be presented with the summary and document without any extra markings:
            <br></br>
            <img className="instruction_images" src={start_window_img} alt="start" />
            <br></br>
            We encourage you to skim through the summary so you are familiar with its content, before starting.
            <br></br>
            You will work sentence by sentence, where you will not be able to continue to the next sentence before "highlighting" all of the current sentence's words.
            <br></br>
            To help you focus, the sentence you need to work on will be in bold.
            <br></br>
            You goal is to choose alignments between the summary and the doc. To help you, when highlighting a span from the document,  all the words in the document who have identical or relating words to that span will be <text className="boldfaced-word">boldfaced and increased:</text>
            <br></br>
            <img className="instruction_images" src={some_span_chosen_img} alt="some_span_chosen" />
            <br></br>
            <br></br>
            <br></br>
            If no span was chosen, all the words in the document who have identical or relating words in current sentence will be <text className="boldfaced-word">boldfaced and increased</text>.
            <br></br>
            At any given time, you can adjust the level of bolding, using the slider at the top-right corner of the UI:
            <br></br>
            <img className="instruction_images" src={appbar_img} alt="appbar" />
            <br></br>
            with the following bolding options:
            <ul>
              <li >No bolding (leftmost)</li>
              <li>Current span bolding (middle)</li>
              <li>Current sentence bolding (rightmost)</li>
            </ul>
            <br></br>
            You will work in iterations:
            <ol>
              <li>
                Start by choosing a subspan of the summary sentence which contains at least one event (by highlighting it).
                <br></br>
                This will boldface all the words in the document identical or similar to those in the span.
              </li>

              <li>Then, highlight spans in the document aligning to the information in the span.</li>
              <li>Before heading on to the next span, please make sure you covered all the span's information and only it. If needed, make adjustments to the highlightings.</li>
            </ol>
            When finishing all the summary document, wou would be able to continue to the next sentence.
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
            can be seperated like this:

            <ol>
              <li>Sixty Forest Service firefighters brought Michigan's four-day Hiawatha National Forest fire under control</li>
              <li>fire under control after it burned 1100 acres of woodlands.</li>
            </ol>

            Or like this:

            <ol>
              <li>Sixty Forest Service firefighters brought ... fire under control</li>
              <li>Michigan's four-day Hiawatha National Forest fire</li>
              <li>fire under control after it burned 1100 acres of woodlands.</li>
            </ol>
            and shouldn't be handled all at once.
            <br></br>
            <b> Notice! Make sure that what you highlight in the document covers all the information in the summary and only it.</b>
            <br></br>
            After choosing and confirming alignments, they will be shown in light-gray color (in juxtaposition to currenly chosen alignments, which are in yellow).
             At any given time, you can adjust how much of previously chosen alignments to see, using the slider adjacent to the bolding slider (see image above), with the following options:
            <ul>
              <li>No previous highlightings (leftmost)</li>
              <li>Only Current sentence's previous highlightings (middle)</li>
              <li>All previous highlightings (rightmost)</li>
            </ul>
            
            In addition, you can also revise old highlightings, by clicking the "REVISE" button that is located on the right side of the app-bar (see image above). 
            <br></br>
            When in "Revise" mode you can hover over old highlightings, and their alignments will show to help you choose:
            <br></br>
            <img className="instruction_images" src={revise_hover_img} alt="revise_hover" />
            <br></br>
            <br></br>
            <br></br>
            By clicking one of them, only the chosen alignment will stay, which you could then revise:
            <br></br>
            <img className="instruction_images" src={revise_clicked_img} alt="revise_clicked" />
            <br></br>
            <br></br>
            <br></br>
            When finishing revising, you will need to return to the main session to continue, by clicking the "FINISH REVISION" button at the top of the window:
            <br></br>
            <img className="instruction_images" src={appbar_finish_revision_img} alt="appbar_finish_revision" />
            <br></br>
            <br></br>
            <br></br>

            Finally, after finishing the last summary sentence, you will be able to submit:
            <img className="instruction_images" src={submit_img} alt="submit" />
          </h4>
        </section>
      </div>
    </>
  )
}

export default Instructions

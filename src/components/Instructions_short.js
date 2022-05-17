import { Title } from '@mui/icons-material';
import good_alignment_img from '../data/Instructions_short/alignment_example.JPG'; // Tell webpack this JS file uses this image
import { Link } from 'react-router-dom'

import wrong_alignment_img from '../data/Instructions_short/alignment_example_wrong_editted.JPG'; // Tell webpack this JS file uses this image
import { Player, BigPlayButton } from 'video-react';
// import ReactPlayer from 'react-player'
import "../../node_modules/video-react/dist/video-react.css"; // import css

const Instructions_short = () => {
  return (
      <div>
        <section  className="InstructionsBody">
          <h3>Instructions</h3>
          <h4>
            In this task, you are presented with a document and its summary.
            <br/>
            Your goal is to identify which phrases in the <u>document</u> contributed to the creation of the summary and highlight them.
            <br/>
            Let's look at an example:
            <br/>
            <img className="instruction_images" src={good_alignment_img} alt="some_span_chosen" />
            <br/>
            We can see that the summary is derived from three spans in the document:
            <ul>
              <li>"Two U.S. Air Force F-16 fighters...crashed and exploded today" (in the summary) is derived from the first highlighted span in the document.</li>
              <li>"each carrying a single pilot" (in the summary) is derived from the third highlighted span in the document.</li>
              <li>"from the 50th Tactical Air Wing at Hahn" (in the summary) is derived from the second highlighted span in the document.</li>
            </ul>
            <br/>
            <b><u>Pay attention</u>!</b>
            <br/>
            <b>It is important that you highlight everything that is mentioned in the summary.</b>
            <br/>
            Highlighting only the first highlighted span ("Two U.S. Air Force F-16 fighter jets crashed today and exploded") 
            <br/>
            would overlook details about those jets that are listed in the summary.
            <br/>
            <b><u>In addition</u>:</b>
            <br/>
            <b>Make sure you don't highlight information that wasn't mentioned in the summary.</b>
            <br/>
            In our example, the following highlighting would have been <b><u>wrong</u></b>:
            <br/>
            <img className="instruction_images" src={wrong_alignment_img} alt="some_span_chosen" />
            <br/>
            The reason this highlighting is incorrect is that it wasn't mentioned in the summary that the crash occurred at 1:30 P.M.
            <br/>
            Similarly, highlighting the "She said" that appears before the second highlight would be incorrect, 
            <br/>
            since this information does not appear in the summary.
            <br/>
            <br/>
            Finally, please watch the following short video, which explains how to use the Task Interface, 
            <br/>
            and then proceed to the task by clicking the "TO TASK" button which is at the bottom-right corner of the page:
            <br/>
            <br/>

            {/* <div className='player-wrapper'>
              <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=ysz5S6PUM-U'
                width='100%'
                height='100%'
              />
            </div> */}


          <div className='player-wrapper'>
            <Player
              playsInline
              src="./Videos/short_intro_UI_video.mp4"
              width="100%"
              height="100%"
            >
              <BigPlayButton position="center" />
            </Player>
          </div>
          <br/>
          <br/>
          <br/>
          <Link to="/">
            <button type="button" className={`btn btn-primary btn-huge`}>
                  TO TASK
            </button>
          </Link>

          </h4>

        </section>

      </div>
  )
}

export default Instructions_short

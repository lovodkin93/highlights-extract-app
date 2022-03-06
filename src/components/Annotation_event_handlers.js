import { useState, useEffect } from 'react'

const DocMouseClickHandler = ({tkn_id, toggleDocHighlight, DocMouseclickStartID, DocMouseclicked, SetDocMouseDownStartID, SetDocMouseclicked}) => {
    const update_tkn = DocMouseclicked ? "-1" : tkn_id;
    if (DocMouseclicked){
      const min_ID =  (DocMouseclickStartID > tkn_id) ? tkn_id : DocMouseclickStartID;
      const max_ID =  (DocMouseclickStartID > tkn_id) ? DocMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleDocHighlight(chosen_IDs);     
    }
    SetDocMouseDownStartID(update_tkn);
    SetDocMouseclicked(!DocMouseclicked);
  }


  const SummaryMouseClickHandler = ({tkn_id, toggleSummaryHighlight, SummaryMouseclickStartID, SummaryMouseclicked, SetSummaryMouseDownStartID, SetSummaryMouseclicked}) => {  
    const update_tkn = SummaryMouseclicked ? "-1" : tkn_id;
    if (SummaryMouseclicked){
      const min_ID =  (SummaryMouseclickStartID > tkn_id) ? tkn_id : SummaryMouseclickStartID;
      const max_ID =  (SummaryMouseclickStartID > tkn_id) ? SummaryMouseclickStartID : tkn_id;
      let chosen_IDs = [];
      for(let i=min_ID; i<=max_ID; i++){
        chosen_IDs.push(i);
      }
      toggleSummaryHighlight(chosen_IDs);     
    }
    SetSummaryMouseDownStartID(update_tkn);
    SetSummaryMouseclicked(!SummaryMouseclicked);
  }

  export { DocMouseClickHandler, SummaryMouseClickHandler }

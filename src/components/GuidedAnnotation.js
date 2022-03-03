import { Link } from 'react-router-dom'

const GuidedAnnotation = () => {
  return (
      <>
      <div>
          <title>Guided Annotation</title>
          <h3>This is where the guided annotation will be</h3>
      </div>
      <div>  
        <Link to='/homepage'>back</Link>
      </div>
      </>
  )
}

export default GuidedAnnotation
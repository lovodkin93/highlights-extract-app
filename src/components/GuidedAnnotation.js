import { Link } from 'react-router-dom'

const GuidedAnnotation = () => {
  return (
      <>
      <div>
          <title>Guided Annotation</title>
          <p>
              <h3>This is where the guided annotation will be</h3>
          </p>
      </div>
      <div>  
        <Link to='/'>back</Link>
      </div>
      </>
  )
}

export default GuidedAnnotation
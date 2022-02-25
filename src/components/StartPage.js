import { Link } from 'react-router-dom'

const StartPage = () => {
  console.log("AVIVSL: delete me in the end")
  return (
    <header>
        <h1>
            Welcome to the Highlighting Extraction UI
        </h1>
        <ul>
          <li>
            <Link to='/instructions'>Instructions</Link>
          </li>
          <li>
            <Link to='/guidedAnnotation'>Guided Annotation</Link>
          </li>
          <li>
            <Link to='/annotation'>Annotation</Link>
          </li>
        </ul>
    </header>
  )
}

export default StartPage




// const StartPage = () => {
//     return (
//       <footer>
//         <p>Copyright &copy; 2021</p>
//       </footer>
//     )
//   }
  
//   export default StartPage
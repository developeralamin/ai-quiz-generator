import './App.css'
import QuizGenerator from './components/quiz/QuizGenerator'
import './components/QuizGenerator.css'

function App() {
  return (
    <>
      <div className="app-container">
        <h1>AI Quiz Generator</h1>
        <p className="description">
          Enter any text below and get an AI-generated quiz based on the content!
        </p>
        <QuizGenerator />
      </div>
    </>
  )
}

export default App

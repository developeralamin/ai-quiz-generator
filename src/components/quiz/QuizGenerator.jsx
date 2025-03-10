import axios from "axios";
import React, { useState } from "react";

const QuizGenerator = () => {
    const [text, setText] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [error, setError] = useState("");
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [lastQuizIndex, setLastQuizIndex] = useState(null);
    const [quizGenerated, setQuizGenerated] = useState(false); // Track if quiz is generated

    const generateQuiz = async () => {
        if (!text.trim()) {
            setError("Please enter some text to generate a quiz.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/generate-quiz`, { text });
            
            if (response.data) {
                const quizData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                setQuiz([quizData]); // Only store the latest quiz
                setLastQuizIndex(0); 
                setAnswers({});
                setScore(0);
                setShowAnswers(false);
                setCorrectAnswers([]);
                setQuizGenerated(true); // Enable Refresh button
            } else {
                setError("No quiz generated. Please try again.");
            }
        } catch (error) {
            console.error("Error generating quiz:", error);
            setError("Error generating quiz.");
        }

        setLoading(false);
    };

    const handleAnswerSelect = (quizIndex, questionIndex, selectedAnswer) => {
        if (showAnswers) return;
        setAnswers(prev => ({
            ...prev,
            [`${quizIndex}-${questionIndex}`]: selectedAnswer
        }));
    };

    const calculateScore = () => {
        if (lastQuizIndex === null || !quiz[lastQuizIndex]) return;

        const lastQuiz = quiz[lastQuizIndex];
        let correctCount = 0;
        const correctAnswersTemp = [];

        lastQuiz.forEach((question, index) => {
            const answerKey = `${lastQuizIndex}-${index}`;
            const selectedAnswer = answers[answerKey];
            if (selectedAnswer === question.answer) {
                correctCount++;
            }
            correctAnswersTemp.push({ question: question.question, correctAnswer: question.answer });
        });

        const newScore = (correctCount / lastQuiz.length) * 100;
        setScore(newScore);
        setCorrectAnswers(correctAnswersTemp); 
        setShowAnswers(true);
    };

    const handleRefresh = () => {
        setText("");
        setQuiz([]);
        setAnswers({});
        setScore(0);
        setShowAnswers(false);
        setError("");
        setCorrectAnswers([]);
        setLastQuizIndex(null);
        setQuizGenerated(false); 
    };

    return (
        <div className="quiz-container">
            <h2>AI Quiz Generator</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="5"
                className="text-input"
                placeholder="Enter text for quiz generation..."
            />
            {error && <p className="error-message">{error}</p>} 
            
            <button onClick={generateQuiz} disabled={loading} className="generate-btn">
                {loading ? "Generating..." : "Generate Quiz"}
            </button>

            <div className="quiz-questions">
                {quiz.map((quizSet, quizIndex) => (
                    <div key={quizIndex} className="quiz-set">
                        <h3>Quiz {quizIndex + 1}</h3>
                        {quizSet.map((question, questionIndex) => (
                            <div key={questionIndex} className="question-card">
                                <p className="question">
                                    {question.question_no}. {question.question} {/* Show question number */}
                                </p>
                                {question.options ? (
                                    <div className="options-container">
                                        {question.options.map((option, optionIndex) => (
                                            <button
                                                key={optionIndex}
                                                onClick={() => handleAnswerSelect(quizIndex, questionIndex, option.split(')')[0])}
                                                className={`option-btn ${
                                                    answers[`${quizIndex}-${questionIndex}`] === option.split(')')[0] 
                                                        ? 'selected correct'  
                                                        : ''
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="true-false-container">
                                        <button
                                            onClick={() => handleAnswerSelect(quizIndex, questionIndex, 'True')}
                                            className={`option-btn ${
                                                answers[`${quizIndex}-${questionIndex}`] === 'True' ? 'selected correct' : ''
                                            }`}
                                            disabled={showAnswers}
                                        >
                                            True
                                        </button>
                                        <button
                                            onClick={() => handleAnswerSelect(quizIndex, questionIndex, 'False')}
                                            className={`option-btn ${
                                                answers[`${quizIndex}-${questionIndex}`] === 'False' ? 'selected correct' : ''
                                            }`}
                                            disabled={showAnswers}
                                        >
                                            False
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {lastQuizIndex !== null && quiz[lastQuizIndex] && !showAnswers && (
                <button onClick={calculateScore} className="calculate-score-btn">
                    Calculate Score
                </button>
            )}

            {showAnswers && lastQuizIndex !== null && quiz[lastQuizIndex] && (
                <div className="score-display">
                    <h3>Your Score: {score.toFixed(1)}%</h3>
                    <p>
                        Correct Answers: {correctAnswers.filter((item, index) => {
                            const answerKey = `${lastQuizIndex}-${index}`;
                            return answers[answerKey] === item.correctAnswer;
                        }).length} out of {quiz[lastQuizIndex].length}
                    </p>

                    <div className="correct-answers-box">
                        <h4>Correct Answers:</h4>
                        <ul>
                            {correctAnswers.map((item, index) => (
                                <li key={index}>
                                    <strong>{item.question}</strong>: {item.correctAnswer}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        <button 
            onClick={handleRefresh} 
            className="refresh-btn" 
            disabled={!quizGenerated}
            style={{
                backgroundColor: quizGenerated ? "#f44336" : "white", 
                color: quizGenerated ? "white" : "black", 
                cursor: quizGenerated ? "pointer" : "not-allowed",
                border: "1px solid #ccc",
                padding: "10px 15px",
                fontSize: "16px",
                borderRadius: "5px",
                transition: "background-color 0.3s ease",
            }}
        >
            Refresh Quiz
        </button>

        </div>
    );
};

export default QuizGenerator;

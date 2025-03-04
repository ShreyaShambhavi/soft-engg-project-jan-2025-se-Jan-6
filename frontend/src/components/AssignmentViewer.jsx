import React, { useState } from 'react';

function AssignmentViewer({ assignment }) {
    const [selectedAnswers, setSelectedAnswers] = useState({});

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{assignment.title}</h2>
                <p className="text-sm text-gray-500">{assignment.subtitle}</p>
            </div>

            <div className="text-sm mb-4 text-red-600">
                The due date for submitting this assignment has passed.
                <br />
                Due on {assignment.dueDate}
            </div>

            <div className="text-sm mb-4 text-green-600">
                You may submit any number of times before the due date. The final submission will be considered for grading.
                <br />
                You have last submitted on: {assignment.lastSubmitted}
            </div>

            {assignment.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-gray-800">{question.text}</p>
                        <span className="text-sm text-gray-500">{question.points} point</span>
                    </div>

                    <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                            <label 
                                key={optionIndex} 
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                                <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    checked={selectedAnswers[questionIndex] === optionIndex}
                                    onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                                    className="form-radio"
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end space-x-4 mt-6">
                <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Submit Assignment
                </button>
            </div>
        </div>
    );
}

export default AssignmentViewer;
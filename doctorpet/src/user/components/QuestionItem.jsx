import React from 'react'
import "../css/QuestionItem.css";
const QuestionItem = (props) => {
  return (
    <div className='question-item'>
        <div className='question'>
            <div><i className="ri-questionnaire-line"></i>{props.question}</div>
        </div>
        <div className='answer'>
            <div>{props.answer || "Đang đợi phản hồi"}<i className="ri-reply-fill"></i></div>
        </div>
    </div>
  )
}

export default QuestionItem
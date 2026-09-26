import React, { useState } from "react";
import QuestionItem from "../components/QuestionItem";
import "../css/Question.css";
const Question = () => {
  const [data, setData] = useState([
    {
      question: "Chó của tôi bị ho liên tục, có sao không?",
      answer:
        "Bác sĩ khuyên bạn nên đưa chó đến kiểm tra ngay, có thể là viêm đường hô hấp.",
    },
    {
      question: "Mèo không ăn uống, tôi nên làm gì?",
      answer:
        "Hãy quan sát mèo 24 giờ, nếu vẫn không ăn thì cần mang đến phòng khám.",
    },
    {
      question: "Làm thế nào để tẩy giun cho thú cưng?",
      answer: null,
    },
  ]);
  //hiện bảng nhập câu hỏi
  const [showQuestion,setShowQuestion] = useState(false)
  const handleShowQuestion = () => {
    setShowQuestion(!showQuestion)
  }
  // thêm câu hỏi
  const [newQuestion, setNewQuestion] = useState("");
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (newQuestion.trim() === "") return;
    setData([...data, { question: newQuestion, answer: null }]);
    setNewQuestion("");
    setShowQuestion(false);
  };
  return (
    <>
      <div className="question-main">
        <div className="question-list">
          {data.map((item, index) => (
            <QuestionItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
        <div className={`add-item-question ${showQuestion === true ? "close" : ""}`} onClick={handleShowQuestion}>
          <div className="icon-add-question">
            <i className="ri-add-fill"></i>
          </div>
        </div>
        {showQuestion && (
        <div className="form-add-question">
          <form className="form-input" onSubmit={handleAddQuestion}>
            <textarea
              className="input"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              rows={3}
            />
            <button className="btn btn-primary btn-add-question" type="submit">Gửi câu hỏi</button>
          </form>
        </div>
      )}
      </div>
    </>
  );
};

export default Question;

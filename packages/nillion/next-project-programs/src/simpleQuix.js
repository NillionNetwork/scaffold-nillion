const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const quiz = [
    {
        question: "What is the capital of France?",
        choices: ["1. Berlin", "2. Madrid", "3. Paris", "4. Rome"],
        correctAnswer: 2
    },
    {
        question: "What is 2 + 2?",
        choices: ["1. 3", "2. 4", "3. 5", "4. 6"],
        correctAnswer: 1
    },
    {
        question: "What is the color of the sky on a clear day?",
        choices: ["1. Green", "2. Blue", "3. Red", "4. Yellow"],
        correctAnswer: 1
    }
];

function getUserAnswer(question, choices, callback) {
    console.log(question);
    choices.forEach(choice => console.log(choice));

    rl.question("Enter the number of your answer: ", (answer) => {
        callback(parseInt(answer) - 1); 
    });
}

function main() {
    let score = 0;
    let currentQuestion = 0;

    function nextQuestion() {
        if (currentQuestion < quiz.length) {

            getUserAnswer(quiz[currentQuestion].question, quiz[currentQuestion].choices, (userAnswer) => {
                if (userAnswer === quiz[currentQuestion].correctAnswer) {
                    console.log("Correct!");
                    score++;
                } else {
                    console.log("Incorrect. The correct answer was " + (quiz[currentQuestion].correctAnswer + 1) + ".");
                }

                console.log(""); 

                currentQuestion++;
                nextQuestion();
            });
        } else {
            console.log("Quiz complete! Your final score is: " + score + "/" + quiz.length);
            rl.close();
        }
    }

    nextQuestion();
}

main();




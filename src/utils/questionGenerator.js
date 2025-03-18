import { PORT_DATA, QUESTION_TYPES } from '../constants/gameConstants';

class QuestionGenerator {
  constructor(data, options = {}) {
    this.data = data;
    this.options = {
      numOptions: options.numOptions || 2,
      ...options
    };
  }

  // Generic method to get random item from array
  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generic method to shuffle array
  shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  // Generic method to generate options
  generateOptions(correctAnswer, possibleAnswers) {
    const options = [correctAnswer];
    const filtered = possibleAnswers
      .filter(item => item !== correctAnswer)
      .sort(() => Math.random() - 0.5);
    
    options.push(...filtered.slice(0, this.options.numOptions - 1));
    return this.shuffle(options);
  }
}

// Specific implementation for Port Game
export class PortQuestionGenerator extends QuestionGenerator {
  constructor(options = {}) {
    super(PORT_DATA, options);
    this.protocols = [...new Set(Object.values(PORT_DATA).map(data => data.protocol))];
    this.ports = Object.keys(PORT_DATA);
  }

  generate() {
    const isPortQuestion = Math.random() > 0.5;

    if (isPortQuestion) {
      const protocol = this.getRandomItem(this.protocols);
      const matchingPorts = Object.entries(this.data)
        .filter(([_, data]) => data.protocol === protocol)
        .map(([port, _]) => port);
      const correctPort = this.getRandomItem(matchingPorts);

      return {
        type: QUESTION_TYPES.PORT,
        title: "What is the port number for:",
        subject: protocol,
        correctAnswer: correctPort,
        options: this.generateOptions(correctPort, this.ports),
        category: this.data[correctPort].category,
        hint: `Used for ${this.data[correctPort].category.toLowerCase()}`
      };
    }

    const port = this.getRandomItem(this.ports);
    const protocol = this.data[port].protocol;

    return {
      type: QUESTION_TYPES.PROTOCOL,
      title: "What protocol uses port:",
      subject: port,
      correctAnswer: protocol,
      options: this.generateOptions(protocol, this.protocols),
      category: this.data[port].category,
      hint: `Used for ${this.data[port].category.toLowerCase()}`
    };
  }
}
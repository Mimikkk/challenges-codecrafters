use crate::messages::answer::*;
use crate::messages::header::*;
use crate::messages::question::*;
use crate::messages::traits::*;

#[derive(Clone, Debug)]
pub struct MessageBuffer(pub Vec<u8>);

impl From<MessageBuffer> for Vec<u8> {
  fn from(MessageBuffer(buffer): MessageBuffer) -> Self {
    buffer
  }
}

impl From<MessageBuffer> for MessageProperties {
  fn from(MessageBuffer(buffer): MessageBuffer) -> Self {
    let mut offset = 0;
    let header = HeaderProperties::from(HeaderBuffer(buffer.clone()));
    offset += 12;

    let mut questions = vec![];
    for _ in 0..header.question_count {
      let question = QuestionBuffer(buffer.clone(), offset);
      let props = QuestionProperties::from(question);
      offset += props.size_of();
      questions.push(props);
    }

    let mut answers = vec![];
    for _ in 0..header.answer_record_count {
      let answer = AnswerBuffer(buffer.clone(), offset);
      let props = AnswerProperties::from(answer);
      offset += props.size_of();
      answers.push(props);
    }

    Self {
      header,
      questions,
      answers,
    }
  }
}

#[derive(Clone, Debug)]
pub struct MessageProperties {
  pub header: HeaderProperties,
  pub questions: Vec<QuestionProperties>,
  pub answers: Vec<AnswerProperties>,
}

impl SizeOf for MessageProperties {
  fn size_of(&self) -> usize {
    self.header.size_of()
      + self.questions.iter().map(|question| question.size_of()).sum::<usize>()
      + self.answers.iter().map(|answer| answer.size_of()).sum::<usize>()
  }
}

impl From<MessageProperties> for Vec<u8> {
  fn from(properties: MessageProperties) -> Self {
    MessageBuffer::from(properties).into()
  }
}

impl From<MessageProperties> for MessageBuffer {
  fn from(properties: MessageProperties) -> Self {
    let mut buffer = Vec::new();

    let header_buffer: Vec<u8> = HeaderBuffer::from(properties.header).into();
    buffer.extend(header_buffer);

    for question in properties.questions {
      let question_buffer: Vec<u8> = QuestionBuffer::from(question).into();

      buffer.extend(question_buffer);
    }

    for answer in properties.answers {
      let answer_buffer: Vec<u8> = AnswerBuffer::from(answer).into();

      buffer.extend(answer_buffer);
    }

    MessageBuffer(buffer)
  }
}

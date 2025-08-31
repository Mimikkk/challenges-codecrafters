#![allow(non_upper_case_globals)]
#[allow(unused_imports)]
pub mod macros;
pub mod messages;
use rand::random;
use std::net::UdpSocket;

use crate::messages::*;

const Host: &str = "127.0.0.1";
const Port: u16 = 2053;

fn main() {
  let args = std::env::args().collect::<Vec<String>>();
  let mut resolver = None;
  if args.len() > 1 && args[1] == "--resolver" {
    resolver = Some(&args[2]);
  }

  let socket = UdpSocket::bind(format!("{}:{}", Host, Port)).expect("Failed to bind to address");
  let mut buffer = vec![0; 512];

  loop {
    match socket.recv_from(&mut buffer) {
      Ok((size, source)) => {
        println!("Received {} bytes from {}", size, source);

        let request = MessageProperties::from(MessageBuffer(buffer[..size].to_vec()));

        let header = request.header;
        let id = header.id;
        let opcode = header.operation_code();
        let recursion_desired = header.is_recursion_desired();
        let rcode = if opcode == 0 { 0 } else { 4 };
        let flags = Flags::Response
          | Flags::recursion_desired(recursion_desired)
          | Flags::from_operation_code(opcode)
          | Flags::from_response_code(rcode);

        let questions: Vec<QuestionProperties> = (0..header.question_count as usize)
          .map(|i| QuestionProperties {
            domain_name: request.questions[i].domain_name.clone(),
            record_type: RecordType::Host,
            record_class: RecordClass::Internet,
          })
          .collect();

        let mut answers = vec![];
        if let Some(resolver) = &resolver {
          for question in &request.questions {
            let flags = Flags::Query
              | Flags::recursion_desired(recursion_desired)
              | Flags::from_operation_code(opcode)
              | Flags::from_response_code(rcode);

            let payload = MessageProperties {
              header: HeaderProperties {
                id: random::<u16>(),
                flags,
                question_count: 1,
                answer_record_count: 0,
                authority_record_count: 0,
                additional_record_count: 0,
              },
              questions: vec![question.clone()],
              answers: vec![],
            };

            let response: Vec<u8> = payload.into();
            socket.send_to(&response, resolver).expect("Failed to send request");
            let (size, _) = socket.recv_from(&mut buffer).expect("Failed to receive response");
            let response = MessageProperties::from(MessageBuffer(buffer[..size].to_vec()));

            answers.extend(response.answers);
          }
        } else {
          for question in request.questions {
            answers.push(AnswerProperties {
              domain_name: question.domain_name.clone(),
              record_type: RecordType::Host,
              record_class: RecordClass::Internet,
              time_to_live: 60,
              data: vec![8, 8, 8, 8],
            });
          }
        };

        let message = MessageProperties {
          header: HeaderProperties {
            id,
            flags,
            question_count: questions.len() as u16,
            answer_record_count: answers.len() as u16,
            authority_record_count: 0,
            additional_record_count: 0,
          },
          questions,
          answers,
        };

        let response: Vec<u8> = message.into();
        socket.send_to(&response, source).expect("Failed to send response");
      }
      Err(message) => {
        eprintln!("Error receiving data: {}", message);
        break;
      }
    }
  }
}

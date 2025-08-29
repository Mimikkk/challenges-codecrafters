import { Buffer } from "node:buffer";
import { AnswerCodec, type AnswerFields } from "./AnswerCodec.ts";
import { HeaderCodec, type HeaderFields } from "./HeaderCodec.ts";
import { QuestionCodec, type QuestionFields } from "./QuestionCodec.ts";

/**
 * The DNS message contains the following sections:
 *  - Header section
 *  - Question section
 *  - Answer section
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1
 */
export interface PacketFields {
  /** Header section of a DNS message.
   * @see HeaderFields
   */
  header: HeaderFields;
  /** Question section of a DNS message.
   * @see QuestionFields
   */
  questions: QuestionFields[];
  /** Answer section of a DNS message.
   * @see AnswerFields
   */
  answers: AnswerFields[];
}

export class PacketCodec {
  static sizeOf({ header, questions, answers }: PacketFields): number {
    return (
      HeaderCodec.sizeOf() +
      questions.reduce((a, b) => a + QuestionCodec.sizeOf(b), 0) +
      answers.reduce((a, b) => a + AnswerCodec.sizeOf(b), 0)
    );
  }

  static decode(packet: Buffer): PacketFields {
    const [header, headerEndsAt] = HeaderCodec.decode(packet, 0);

    let offset = headerEndsAt;

    const questions = [];
    for (let i = 0; i < header.questionCount; ++i) {
      const [question, questionEndsAt] = QuestionCodec.decode(packet, offset);
      questions.push(question);
      offset = questionEndsAt;
    }

    const answers = [];
    for (let i = 0; i < header.answerRecordCount; ++i) {
      const [answer, answerEndsAt] = AnswerCodec.decode(packet, offset);
      answers.push(answer);
      offset = answerEndsAt;
    }

    return { header, questions, answers };
  }

  static encode(fields: PacketFields, buffer: Buffer, offset: number): number {
    const { header, questions, answers } = fields;

    offset = HeaderCodec.encode(buffer, offset, header);
    for (let i = 0; i < questions.length; ++i) {
      offset = QuestionCodec.encode(buffer, offset, questions[i]);
    }
    for (let i = 0; i < answers.length; ++i) {
      offset = AnswerCodec.encode(buffer, offset, answers[i]);
    }

    return offset;
  }

  static encodeIntoBuffer(fields: PacketFields): Buffer {
    const buffer = Buffer.allocUnsafe(this.sizeOf(fields));
    this.encode(fields, buffer, 0);
    return buffer;
  }
}

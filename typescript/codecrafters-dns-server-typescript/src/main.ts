import { Buffer } from "node:buffer";
import dgram from "node:dgram";
import { parseArgs } from "node:util";
import type { HeaderFields } from "./dns/messages/HeaderCodec.ts";
import { MessageType, OperationCode, ResponseCode } from "./dns/messages/messages.types.ts";
import { PacketCodec, type PacketFields } from "./dns/messages/PacketCodec.ts";

let resolver: { host: string; port: number } | undefined = undefined;
const args = parseArgs({
  options: { resolver: { type: "string" } },
  allowPositionals: true,
});

if (args.values.resolver) {
  const [host, port] = args.values.resolver.split(":");
  resolver = { host, port: +port };
}

const host = "127.0.0.1";
const port = 2053;

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(port, host);

udpSocket.on("message", async (packet: Buffer, remote: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remote.address}:${remote.port}`);

    const request = PacketCodec.decode(packet);
    const isQuery = request.header.operationCode === OperationCode.StandardQuery;
    const responseCode = isQuery ? ResponseCode.NoError : ResponseCode.NotImplemented;

    const { answers } = await forward(request, resolver);

    const header: HeaderFields = {
      packetIdentifier: request.header.packetIdentifier,
      queryResponseIndicator: MessageType.Response,
      operationCode: request.header.operationCode,
      authoritativeAnswer: false,
      truncation: false,
      recursionDesired: request.header.recursionDesired,
      recursionAvailable: false,
      reserved: 0,
      responseCode,
      questionCount: request.questions.length,
      answerRecordCount: answers.length,
      authorityRecordCount: 0,
      additionalRecordCount: 0,
    };

    const response = PacketCodec.encodeIntoBuffer({ header, questions: request.questions, answers });

    udpSocket.send(response, remote.port, remote.address);
  } catch (e) {
    console.error(
      `Error sending data: ${e instanceof Error ? e.message : String(e)}`,
      e instanceof Error ? e.stack : undefined,
    );
  }
});

const forward = async (
  request: PacketFields,
  resolver: { host: string; port: number } | undefined,
): Promise<PacketFields> => {
  if (!resolver) return request;

  const socket = dgram.createSocket("udp4");

  const packets = request.questions.map((question) => ({
    ...request,
    header: { ...request.header, questionCount: 1 },
    questions: [question],
  }));

  const promises = packets.map(() =>
    new Promise<Buffer>((resolve, reject) => {
      socket.on("message", (buffer) => {
        console.log("Received forwarded data response binary");
        resolve(buffer);
      });

      socket.on("error", (error) => {
        console.error("Error forwarding data", error);
        reject(error);
      });
    })
  );
  for (const packet of packets) {
    socket.send(PacketCodec.encodeIntoBuffer(packet), resolver.port, resolver.host);
  }
  const responses = (await Promise.all(promises)).map((response) => PacketCodec.decode(response));
  const answers = responses.flatMap((response) => response.answers);
  const questions = responses.flatMap((response) => response.questions);

  return { header: request.header, answers, questions };
};

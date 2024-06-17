"use server";

import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import openai from "@/lib/openai";

type TranscriptReturn = {
  task?: string;
  language?: string;
  duration?: number;
  text: string;
  segments?: {
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }[];
};

function toBuffer(ab: ArrayBuffer) {
  const buffer = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = view[i];
  }

  return buffer;
}

export async function HandleUpload(formData: FormData) {
  if (!formData.get("audio")) {
    return "No file provided.";
  }

  const file = formData.get("audio") as File;
  const fileHash = await GenerateHash(file);

  let audioId = "";
  const exists = await CheckExistingFile(fileHash);
  if (exists) {
    audioId = exists.id;
  }

  if (!exists) {
    try {
      const transcript = await CreateTranscript(file, fileHash);
      audioId = transcript.id;

      const fileBuffer = toBuffer(await file.arrayBuffer());
      await writeFile(`/tmp/${audioId}.mp3`, fileBuffer);
    } catch (error) {
      return "Failed to upload file.";
    }
  }

  redirect(`/audio/${audioId}`);
}

async function CreateTranscript(file: File, hash: string) {
  const transcription: TranscriptReturn =
    await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

  const allSegments = transcription.segments ?? [];
  const audio = await prisma.audio.create({
    data: {
      hash,
      transcript: {
        create: {
          language: transcription.language ?? "en",
          duration: transcription.duration ?? 0,
          text: transcription.text,
          segments: {
            create: allSegments.map((segment) => ({
              start: segment.start,
              end: segment.end,
              text: segment.text,
            })),
          },
        },
      },
    },
  });

  return audio;
}

async function GenerateHash(file: File) {
  const hashSum = createHash("sha256");
  const fileBuffer = await file.arrayBuffer();
  hashSum.update(toBuffer(fileBuffer));

  const hex = hashSum.digest("hex");
  return hex;
}

async function CheckExistingFile(hash: string) {
  const existing = await prisma.audio.findUnique({
    where: {
      hash,
    },
  });

  return existing;
}

"use server";

import openai from "@/lib/openai";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import { redirect } from "next/navigation";

export async function GenerateSummary(
  transcriptId: string,
  transcriptText: string
) {
  const transcript = await prisma.transcript.findUnique({
    where: {
      id: transcriptId,
    },
    include: {
      audioHash: true,
    },
  });

  if (!transcript) {
    return "Transcript not found";
  }

  const generatedSummary = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Your responses must be one sentence and must not be more than 10 words long.",
      },
      {
        role: "user",
        content: "Summarise this transcript:",
      },
      {
        role: "user",
        content: transcriptText,
      },
    ],
    model: "gpt-4o",
  });

  const response = generatedSummary.choices[0].message.content;

  if (!response) {
    return "Failed to generate summary";
  }

  await prisma.summary.create({
    data: {
      transcriptId,
      text: response,
    },
  });

  if (!transcript.audioHash) {
    return "Audio not found";
  }

  redirect(`/audio/${transcript.audioHash.id}`);
}

export async function GenerateSummaryAudio(
  summaryId: string,
  summaryText: string
) {
  const summary = await prisma.summary.findUnique({
    where: {
      id: summaryId,
    },
  });

  if (!summary) {
    return "Summary not found";
  }

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: summaryText,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  const audioHash = await GenerateHash(buffer);

  const summaryAudio = await prisma.summaryAudio.create({
    data: {
      hash: audioHash,
      summaryId,
    },
  });

  await writeFile(`/tmp/${summaryAudio.id}.mp3`, buffer);
  return `/tmp/${summaryAudio.id}.mp3`;
}

async function GenerateHash(file: Buffer) {
  const hashSum = createHash("sha256");
  hashSum.update(file);

  const hex = hashSum.digest("hex");
  return hex;
}

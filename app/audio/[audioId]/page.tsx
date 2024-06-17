import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GenerateSummary } from "./actions";
import AudioElements from "./elements";

type AudioPageProps = {
  params: {
    audioId: string;
  };
};

export default async function AudioPage({ params }: AudioPageProps) {
  const { audioId } = params;

  const audio = await prisma.audio.findUnique({
    where: {
      id: audioId,
    },
  });

  if (!audio) {
    notFound();
  }

  const transcript = await prisma.transcript.findUnique({
    where: {
      id: audio.transcriptId,
    },
  });

  const summary = await prisma.summary.findUnique({
    where: {
      transcriptId: audio.transcriptId,
    },
    include: {
      summaryAudio: true,
    },
  });

  return (
    <AudioElements
      audioId={audioId}
      audio={audio}
      transcript={transcript}
      summary={summary}
      summaryAudio={summary?.summaryAudio ?? null}
    />
  );
}

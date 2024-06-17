"use client";

import { Audio, Summary, SummaryAudio, Transcript } from "@prisma/client";
import { FormEvent, useState } from "react";
import { GenerateSummary, GenerateSummaryAudio } from "./actions";

type AudioElementsProps = {
  audioId: string;
  audio: Audio;
  transcript: Transcript | null;
  summary: Summary | null;
  summaryAudio: SummaryAudio | null;
};

export default function AudioElements({
  audioId,
  audio,
  transcript: initialTranscript,
  summary: initialSummary,
  summaryAudio: initialSummaryAudio,
}: AudioElementsProps) {
  const [transcript, setTranscript] = useState<string | null>(
    initialTranscript?.text ?? null
  );
  const [summary, setSummary] = useState<string | null>(
    initialSummary?.text ?? null
  );
  const [summaryAudio, setSummaryAudio] = useState<string | null>(
    initialSummaryAudio ? `/tmp/${initialSummaryAudio.id}.mp3` : null
  );

  async function generateSummary(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transcript) return;
    await GenerateSummary(audio.transcriptId, transcript);
  }

  async function generateAudio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!summary || !initialSummary) return;
    const response = await GenerateSummaryAudio(initialSummary?.id, summary);
    setSummaryAudio(response);
  }

  return (
    <main className="bg-white dark:bg-slate-900 min-h-dvh w-dvw py-10">
      <div className="container mx-auto">
        <div className="flex flex-col">
          <h1 className="dark:text-white text-3xl font-semibold">
            Your audio: {audioId}
          </h1>
          <div className="flex flex-row mt-6 gap-4">
            <div className="flex flex-col flex-1">
              <h2 className="dark:text-white text-xl font-semibold">
                Transcribe
              </h2>
              <div className="mt-2">
                <textarea
                  rows={4}
                  name="comment"
                  id="comment"
                  className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6 min-h-64"
                  value={transcript ?? ""}
                  onChange={(e) => setTranscript(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <h2 className="dark:text-white text-xl font-semibold">
                    Summary
                  </h2>
                  <div className="flex flex-row gap-2">
                    {!summary && (
                      <form onSubmit={generateSummary}>
                        <button
                          className="h-9 bg-violet-600 rounded-md px-4 text-white font-medium"
                          type="submit"
                        >
                          Generate summary
                        </button>
                      </form>
                    )}

                    {summary && !summaryAudio && (
                      <form onSubmit={generateAudio}>
                        <button className="h-9 bg-violet-600 rounded-md px-4 text-white font-medium">
                          Generate audio
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <textarea
                  rows={4}
                  name="comment"
                  id="comment"
                  className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6 min-h-32"
                  value={summary ?? ""}
                  onChange={(e) => setSummary(e.currentTarget.value)}
                />
                {summaryAudio && (
                  <audio controls>
                    <source src={summaryAudio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

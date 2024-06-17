"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/16/solid";
import {
  ChangeEvent,
  DragEvent,
  DragEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

export default function FileUpload() {
  const { pending } = useFormStatus();
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.currentTarget.files) {
      setFile(null);
      return;
    }

    if (e.currentTarget.files.length === 0) {
      setFile(null);
      return;
    }

    setFile(e.currentTarget.files[0]);
    return;
  }

  function preventDrag(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const data = new DataTransfer();
    data.items.add(e.dataTransfer.files[0]);
    if (!fileInput.current) return;
    fileInput.current.files = data.files;
    setFile(data.files[0]);
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-content"
        onDragOver={preventDrag}
        onDragEnter={preventDrag}
        onDrop={handleDrop}
      >
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ArrowUpTrayIcon className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" />
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MP3 only
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".mp3"
            name="audio"
            onChange={handleChange}
            ref={fileInput}
            disabled={pending}
          />
        </label>
      </div>
      <div className="flex flex-row items-center mt-4 gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 bg-slate-800 px-4 h-10 flex items-center rounded-md">
          {file ? file.name : "No file selected"}
        </p>
        <button
          type="submit"
          className="bg-violet-700 text-violet-100 h-10 rounded-md text-sm px-4 flex flex-row items-center"
          disabled={pending}
        >
          {pending && (
            <div className="animate-spin h-5 w-5 mr-3 border-2 rounded-full border-r-transparent"></div>
          )}
          {pending ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

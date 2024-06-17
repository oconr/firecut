import FileUpload from "@/components/FileUpload";
import { HandleUpload } from "./actions";

export default function Home() {
  return (
    <main className="h-dvh w-dvw flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="container mx-auto">
        <form action={HandleUpload}>
          <FileUpload />
        </form>
      </div>
    </main>
  );
}

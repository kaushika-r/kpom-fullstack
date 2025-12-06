import { studyMethods } from "../data/studyMethods";
import StudyTimer from "../components/StudyTimer";

function StudyMethodCard({ method }) {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-1">{method.name}</h2>
        <p className="text-sm font-medium mb-2 opacity-80">
          {method.pattern}
        </p>
        <p className="text-sm text-gray-600">{method.description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">
        Choose your <span className="italic">study mode</span>.
      </h1>
      <p className="text-gray-600 mb-6 max-w-xl">
        Pick a focus method that matches your energy today. You can log in to
        save your progress, or continue as a guest.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {studyMethods.map((m) => (
          <StudyMethodCard key={m.id} method={m} />
        ))}
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Quick Pomodoro</h2>

        <StudyTimer methodId="pomodoro" />
      </div>

    </>
  );
}

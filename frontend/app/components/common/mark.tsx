import Logo from "./logo";

export default function Mark() {
  return (
    <div className="flex justify-center items-center space-x-2 text-primary">
      <Logo className="w-8 h-8 hover:scale-105 transition-transform" />
      <p className="text-2xl font-medium">Note</p>
    </div>
  );
}

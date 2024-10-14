import Logo from "./logo";

export default function Mark() {
  return (
    <div className="group flex-center space-x-2">
      <Logo className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-105 transition-transform" />
      <p className="text-xl md:text-2xl font-medium">Note</p>
    </div>
  );
}
